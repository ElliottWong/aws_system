const { addDays, differenceInCalendarDays } = require('date-fns');

const db = require('../config/connection');

const {
    Employees,
    Files,
    Documents: { EMP }
} = require('../schemas/Schemas');

const { deleteFile } = require('./files.v1');

const {
    includes: {
        maintenanceAssignees: $includeAssignees,
        maintenanceUploads: $includeUploads
    },
    isEquipmentOwner,
    isAssignedEquipment
} = require('./com.equipment.v3').helpers;

const E = require('../errors/Errors');

// checks all assigned responsible employees
// make sure they are of the same company
const checkCompanyEmployees = async (companyId, employeeIds = []) => {
    const promises = employeeIds.map((employee_id) => Employees.count({
        where: { employee_id, fk_company_id: companyId }
    }));

    const employees = await Promise.all(promises);

    // we find an employee by their employee id and company id
    // if that does not have any results (ie not 1)
    // the employee does not exist within the company/system
    const invalid = employees.some((count) => !(count === 1));
    return !invalid;
};

const checkMultiplierRange = (value, min = 1, max = 99) => {
    const v = parseInt(value);

    if (isNaN(v))
        throw new E.ParamTypeError('freq_multiplier', value, 1);

    const lessThanMin = v < min;
    const moreThanMax = v > max;

    const isOutOfRange = lessThanMin || moreThanMax;

    if (isOutOfRange)
        throw new E.ParamValueError('freq_multiplier', `at least ${min} and not more than ${max}`);

    return v;
};

const convertUnitTime = (value) => {
    switch (value) {
        case 'week':
            return 7;
        case 'month':
            return 30;
        case 'year':
            return 365;
        default:
            throw new E.ParamValueError('freq_unit_time', '"week", "month" or "year"');
    }
};

const clampNegative = (value) => value < 0 ? 0 : value;

const isAssignedMaintenance = async (maintenanceId, employeeId) => {
    const count = await EMP.MaintenanceAssignees.findAll({
        where: {
            fk_maintenance_id: maintenanceId,
            fk_employee_id: employeeId
        }
    });

    const isAssigned = count.length === 1;
    return isAssigned;
};

const calculateFrequency = (multiplier, unitTime, lastServiceAt) => {
    const nextServiceAt = addDays(lastServiceAt, multiplier * unitTime);

    const now = new Date();
    const daysLeft = differenceInCalendarDays(nextServiceAt, now);
    const totalDays = differenceInCalendarDays(nextServiceAt, lastServiceAt);
    const daysLeftPct = clampNegative((daysLeft / totalDays) * 100);

    return {
        nextServiceAt,
        daysLeft,
        daysLeftPct
    };
};

module.exports.helpers = {
    checkCompanyEmployees,
    checkMultiplierRange,
    convertUnitTime,
    isAssignedMaintenance
};

// ============================================================

module.exports.insertOneMaintenance = async (equipmentId, companyId, createdBy, maintenance = {}) => {
    const isOwner = await isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.PermissionError('create maintenance for equipment');

    const {
        type,
        description,
        freq_multiplier,    // 1 - 99
        freq_unit_time,     // 'week', 'month', 'year'
        last_service_at,
        assignees = []      // employeeIds[]
    } = maintenance;

    const multiplier = checkMultiplierRange(freq_multiplier);
    const unitTime = convertUnitTime(freq_unit_time);

    const lastServiceAt = new Date(last_service_at);

    const {
        nextServiceAt,
        daysLeft,
        daysLeftPct
    } = calculateFrequency(multiplier, unitTime, lastServiceAt);

    const validAssignments = await checkCompanyEmployees(companyId, assignees);
    if (!validAssignments) throw new E.ForeignEmployeeError();

    const transaction = await db.transaction();
    try {
        const insertedMaintenance = await EMP.Maintenance.create({
            fk_company_id: companyId,
            fk_equipment_id: equipmentId,
            type,
            description,
            freq_multiplier: multiplier,
            freq_unit_time: unitTime,
            last_service_at: lastServiceAt,
            next_service_at: nextServiceAt,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { transaction });

        const assigneeInsertions = assignees.map((employee_id) => ({
            fk_equipment_id: equipmentId,
            fk_maintenance_id: insertedMaintenance.maintenance_id,
            fk_employee_id: employee_id
        }));

        await EMP.MaintenanceAssignees.bulkCreate(assigneeInsertions, { transaction });

        await transaction.commit();
        return insertedMaintenance;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.insertMaintenanceUpload = async (maintenanceId, createdBy, data = {}, upload) => {
    const isAssigned = await isAssignedMaintenance(maintenanceId, createdBy);
    if (!isAssigned) throw new E.PermissionError('upload for maintenance');

    const {
        serviced_at,
        description
    } = data;

    const {
        originalname: file_name,
        filename: cloudinary_id,
        path: cloudinary_uri
    } = upload;

    const file = {
        file_name,
        cloudinary_id,
        cloudinary_uri,
        created_by: createdBy
    };

    const servicedAt = new Date(serviced_at);

    const transaction = await db.transaction();
    try {
        const [insertedUpload, maintenance] = await Promise.all([
            EMP.MaintenanceUploads.create({
                fk_maintenance_id: maintenanceId,
                created_by: createdBy,
                serviced_at: servicedAt,
                description,
                file
            }, { include: 'file', transaction }),

            EMP.Maintenance.findOne({
                where: { maintenance_id: maintenanceId },
                attributes: ['freq_multiplier', 'freq_unit_time']
            })
        ]);

        const {
            freq_multiplier: multiplier,
            freq_unit_time: unitTime
        } = maintenance;

        const {
            nextServiceAt,
            daysLeft,
            daysLeftPct
        } = calculateFrequency(multiplier, unitTime, servicedAt);

        const where = { maintenance_id: maintenanceId };

        await EMP.Maintenance.update({
            first_notification: false,      // reset notifications
            second_notification: false,
            last_service_at: servicedAt,
            next_service_at: nextServiceAt, // new service
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { where, transaction });

        await transaction.commit();
        return insertedUpload;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.findOneMaintenance = async function ({
    maintenanceId,
    equipmentId,
    companyId,
    employeeId,
    includeAssignees = true,
    includeUploads = true
}) {
    const [isOwner, isAssigned] = await Promise.all([
        isEquipmentOwner(equipmentId, companyId, employeeId),
        isAssignedMaintenance(maintenanceId, employeeId)
    ]);

    if (isOwner || isAssigned) {
        let include = [];
        if (includeAssignees) include = [...include, $includeAssignees];
        if (includeUploads) include = [...include, $includeUploads];

        const maintenance = await EMP.Maintenance.findOne({
            where: {
                maintenance_id: maintenanceId,
                fk_company_id: companyId,
                fk_equipment_id: equipmentId
            },
            include
        });

        return maintenance;
    }

    throw new E.PermissionError('cannot view maintenance');
};

// ============================================================

module.exports.editOneMaintenance = async (maintenanceId, equipmentId, companyId, createdBy, maintenance = {}) => {
    const {
        type,
        description,
        freq_multiplier = false,    // 1 - 99
        freq_unit_time = false,     // 'week', 'month', 'year'
        last_service_at = false,
        assignees = []              // employeeIds[]
    } = maintenance;

    const isOwner = await isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.NotFoundError('equipment');

    // default to false means no value from request
    // we keep undef as that means no change
    const multiplier = freq_multiplier === false
        ? undefined
        : checkMultiplierRange(freq_multiplier);

    const unitTime = freq_unit_time === false
        ? undefined
        : convertUnitTime(freq_unit_time);

    const lastServiceAt = last_service_at === false
        ? undefined
        : new Date(last_service_at);

    const isFrequencyAffected = !!multiplier || !!unitTime || !!lastServiceAt;

    // declare undef
    let nextServiceAt, daysLeft, daysLeftPct;

    // if any of these values are in the request,
    // we need to recalculate the freq
    if (isFrequencyAffected) ({
        nextServiceAt,
        daysLeft,
        daysLeftPct
    } = calculateFrequency(multiplier, unitTime, lastServiceAt));

    const where = {
        maintenance_id: maintenanceId,
        fk_company_id: companyId,
        fk_equipment_id: equipmentId
    };

    const transaction = await db.transaction();
    try {
        await EMP.Maintenance.update({
            type,
            description,
            freq_multiplier: multiplier,
            freq_unit_time: unitTime,
            last_service_at: lastServiceAt,
            next_service_at: nextServiceAt,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { where, transaction });

        if (assignees.length > 0) {
            await EMP.MaintenanceAssignees.destroy({
                where: {
                    maintenance_id: maintenanceId,
                    fk_equipment_id: equipmentId
                },
                transaction
            });

            const assigneeInsertions = assignees.map((employeeId) => ({
                fk_equipment_id: equipmentId,
                fk_maintenance_id: maintenanceId,
                fk_employee_id: employeeId
            }));

            await EMP.MaintenanceAssignees.bulkCreate(assigneeInsertions, { transaction });
        }

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

// FIXME i really dont know if this actually works
module.exports.deleteOneMaintenance = async (maintenanceId, equipmentId, companyId, createdBy) => {
    const isOwner = isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.PermissionError('delete');

    const transaction = await db.transaction();
    try {
        const maintenanceUploads = await EMP.MaintenanceUploads.findAll({
            where: {
                fk_maintenance_id: { maintenanceId }
            }
        });

        // get uploadd files related to this maintenance
        const getFiles = maintenanceUploads.map((upload) => Files.findByPk(upload.fk_file_id));
        const files = await Promise.all(getFiles);

        // destroy them from cloudinary and database
        const destroyFilePromises = files.map((file) => deleteFile(file.file_id));
        await Promise.all(destroyFilePromises);

        // destroy everything else
        const destroyMaintenance = EMP.Maintenance.destroy({
            where: {
                maintenance_id: maintenanceId,
                fk_company_id: companyId,
                fk_equipment_id: equipmentId
            }
        }, { transaction });

        const destroyMaintenanceAssignees = EMP.MaintenanceAssignees.destroy({
            where: {
                fk_maintenance_id: maintenanceId,
                fk_equipment_id: equipmentId
            }
        }, { transaction });

        const destroyMaintenanceUploads = EMP.MaintenanceUploads.destroy({
            where: {
                fk_maintenance_id: maintenanceId
            }
        }, { transaction });

        await Promise.all([
            destroyMaintenance,
            destroyMaintenanceAssignees,
            destroyMaintenanceUploads
        ]);

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.deleteMaintenanceUpload = async (maintenanceUploadId, maintenanceId, createdBy) => {
    const maintenanceUpload = await EMP.MaintenanceUploads.findOne({
        where: {
            maintenance_upload_id: maintenanceUploadId,
            fk_maintenance_id: maintenanceId,
            created_by: createdBy
        },
        include: 'file'
    });

    if (!maintenanceUpload) throw new E.NotFoundError('maintenance upload');

    await deleteFile(maintenanceUpload.file.file_id, createdBy);
    await maintenanceUpload.destroy();
};
