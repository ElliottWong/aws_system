const { addDays, differenceInCalendarDays } = require('date-fns');

const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { EMP }
} = require('../schemas/Schemas');

const { deleteFile } = require('../services/cloudinary.v1');

const E = require('../errors/Errors');

// equipment_type,
// reference_number,
// register_number,
// serial_number,
// model,
// maintenance_type,
// maintenance_frequency_number,
// maintenance_frequency_type,
// location

// checks all assigned responsible employees
// make sure they are of the same company
const companyCheck = async (fk_company_id, employeeIds = []) => {
    const promises = employeeIds.map((employee_id) => Employees.count({
        where: { employee_id, fk_company_id }
    }));

    const employees = await Promise.all(promises);

    // we find an employee by their employee id and company id
    // if that does not have any results (ie not 1)
    // the employee does not exist within the company/system
    const invalid = employees.some((count) => count !== 1);
    return !invalid;
};

const checkMultiplierRange = (value, min = 1, max = 99) => {
    const lessThanMin = value < min;
    const moreThanMax = value > max;

    const isNotValid = lessThanMin || moreThanMax;

    if (isNotValid) throw new E.ParamValueError(
        'maintenance_frequency_multiplier',
        `at least ${min} and not more than ${max}`
    );
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
            throw new E.ParamValueError('maintenance_frequency_unit_time');
    }
};

const clampNegative = (value) => value < 0 ? 0 : value;

module.exports.insertOneEquipment = async (fk_company_id, created_by, equipment = {}) => {
    const {
        equipment_type,
        reference_number,
        register_number,
        serial_number,
        model,
        location,
        maintenance_type,
        maintenance_frequency_multiplier,
        maintenance_frequency_unit_time,
        assignees = [],
        last_service_at
    } = equipment;

    const multiplier = checkMultiplierRange(maintenance_frequency_multiplier);
    const unitTime = convertUnitTime(maintenance_frequency_unit_time);

    const lastServiceAt = new Date(last_service_at);
    const nextServiceAt = addDays(lastServiceAt, multiplier * unitTime);

    const now = new Date();
    const daysLeft = differenceInCalendarDays(nextServiceAt, now);
    const totalDays = differenceInCalendarDays(nextServiceAt, lastServiceAt);
    const daysLeftPct = clampNegative((daysLeft / totalDays) * 100);

    const valid = await companyCheck(fk_company_id, assignees);
    if (!valid) throw new E.ForeignEmployeeError();

    const transaction = await db.transaction();
    try {
        const insertedEquipment = await EMP.Equipment.create({
            fk_company_id,
            created_by,
            equipment_type,
            reference_number,
            register_number,
            serial_number,
            model,
            location,
            maintenance_type,
            maintenance_frequency_multiplier: multiplier,
            maintenance_frequency_unit_time: unitTime,
            last_service_at: lastServiceAt,
            next_service_at: nextServiceAt,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { transaction });

        const assigneeInsertions = assignees.map((employee_id) => ({
            fk_equipment_id: insertedEquipment.equipment_id,
            fk_employee_id: employee_id
        }));

        await EMP.Assignees.bulkCreate(assigneeInsertions, { transaction });

        await transaction.commit();
        return insertedEquipment;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.insertMaintenanceUpload = async (fk_company_id, equipment_id, created_by, serviced_at, file = {}) => {
    const equipment = await EMP.Equipment.findOne({
        where: { equipment_id, fk_company_id }
    });

    if (!equipment) throw new E.NotFoundError('equipment');

    const joinCount = await EMP.Assignees.count({
        where: { fk_equipment_id: equipment_id, fk_employee_id: created_by }
    });

    if (joinCount !== 1) throw new E.PermissionError('upload maintenance for this equipment');

    const {
        originalname: file_name,
        filename: cloudinary_id,
        path: cloudinary_uri
    } = file;

    const serviceDate = new Date(serviced_at);
    const transaction = await db.transaction();
    try {
        const uploadInsertion = EMP.Uploads.create({
            fk_equipment_id: equipment_id,
            created_by,
            serviced_at: serviceDate,
            file: {
                file_name,
                cloudinary_id,
                cloudinary_uri,
                created_by
            }
        }, { include: 'file', transaction });

        const equipmentUpdate = equipment.update({
            last_service_at: serviceDate
        }, { transaction });

        const [insertedUpload] = await Promise.all([uploadInsertion, equipmentUpdate]);

        await transaction.commit();
        return insertedUpload;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

const assignees = {
    association: 'assignees',
    include: {
        association: 'account',
        attributes: ['username']
    },
    through: { attributes: [] }
};

const author = {
    association: 'author',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

module.exports.findEquipment = {
    // either find all active equipment or all archived equipment
    all: (fk_company_id, includeUploads = false, archivedOnly = false) => {
        const where = {
            fk_company_id,
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [author, assignees, 'uploads']
            : [author, assignees];

        return EMP.Equipment.findAll({ where, include });
    },

    allResponsible: async (fk_employee_id, includeUploads = false, archivedOnly = false) => {
        const joinRows = await EMP.Assignees.findAll({
            where: { fk_employee_id }
        });

        const equipmentIds = joinRows.map((row) => row.fk_equipment_id);

        const where = {
            equipment_id: { [Op.or]: equipmentIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [author, assignees, 'uploads']
            : [author, assignees];

        return EMP.Equipment.findAll({ where, include });
    },

    one: async (fk_company_id, equipment_id, employee_id, includeUploads = false) => {
        const equipment = await EMP.Equipment.findOne({
            where: { equipment_id, fk_company_id },
            include: includeUploads
                ? [author, assignees, 'uploads']
                : [author, assignees]
        });

        if (!equipment) throw new E.NotFoundError('equipment');

        // the employee requesting for this equipment created it
        if (equipment.created_by === employee_id) return equipment;

        // the employee requesting for this equipment must be responsible for it
        const joinCount = await EMP.Assignees.count({
            where: {
                fk_equipment_id: equipment_id,
                fk_employee_id: employee_id
            }
        });

        // cannot find the row in the m:n table that relates the employee to the equipment
        if (joinCount !== 1) throw new E.PermissionError('view this equipment');

        return equipment;
    }
};

// ============================================================

module.exports.editOneEquipment = async (fk_company_id, equipment_id, created_by, equipment = {}) => {
    const {
        reference_number, register_number, serial_number,
        model, location,
        maintenance_frequency_number,
        maintenance_frequency_type
    } = equipment;

    const [affectedCount] = await EMP.Equipment.update({
        reference_number, register_number, serial_number,
        model, location,
        maintenance_frequency_number, maintenance_frequency_type
    }, { where: { equipment_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.archiveOneEquipment = async (fk_company_id, equipment_id, created_by) => {
    const [affectedCount] = await EMP.Equipment.update({
        archived_at: new Date()
    }, { where: { equipment_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.activateOneEquipment = async (fk_company_id, equipment_id, created_by) => {
    const [affectedCount] = await EMP.Equipment.update({
        archived_at: null
    }, { where: { equipment_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.deleteOneEquipment = async (fk_company_id, equipment_id, created_by) => {
    const equipmentCount = await EMP.Equipment.count({
        where: { equipment_id, fk_company_id, created_by }
    });

    if (equipmentCount !== 1) throw new E.NotFoundError('equipment');

    // get the uploaded files and delete them
    // const maintenanceFiles = await EMP.MaintenanceUploads.findAll({
    //     where: { fk_equipment_id: equipment_id },
    //     include: 'file'
    // });

    // const deleteFromCloudinaryPromises = maintenanceFiles.map((maintenance) => deleteFile(maintenance.file.cloudinary_id));
    // await Promise.all(deleteFromCloudinaryPromises);

    const transaction = await db.transaction();
    try {
        const destroyed = await Promise.all([
            EMP.Equipment.destroy({
                where: { equipment_id, fk_company_id, created_by }, transaction
            }),
            EMP.Assignees.destroy({
                where: { fk_equipment_id: equipment_id }, transaction
            }),
            EMP.Uploads.destroy({
                where: { fk_equipment_id: equipment_id }, transaction
            })
        ]);

        await transaction.commit();
        return destroyed.reduce((accumulator, current) => accumulator + current, 0);
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
