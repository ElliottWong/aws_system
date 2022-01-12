const { addDays, differenceInCalendarDays } = require('date-fns');

const { Sequelize, Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { EMP }
} = require('../schemas/Schemas');

const { insertFile } = require('./files');
const { isEquipmentOwner, isAssignedEquipment } = require('./com.equipment.v3').helpers;

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
    const invalid = employees.some((count) => count !== 1);
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
            throw new E.ParamValueError('freq_unit_time', 'expected "week", "month" or "year"');
    }
};

const clampNegative = (value) => value < 0 ? 0 : value;

module.exports.helpers = {
    checkCompanyEmployees,
    checkMultiplierRange,
    convertUnitTime
};

// ============================================================

module.exports.insertOneMaintenance = async (equipmentId, companyId, createdBy, maintenance = {}) => {
    const isOwner = await isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.PermissionError('create maintenance for equipment');

    const {
        title,
        description,
        freq_multiplier,    // 1 - 99
        freq_unit_time,     // 'week', 'month', 'year'
        last_service_at,
        assignees = []      // employeeIds[]
    } = maintenance;

    const multiplier = checkMultiplierRange(freq_multiplier);
    const unitTime = convertUnitTime(freq_unit_time);

    const lastServiceAt = new Date(last_service_at);
    const nextServiceAt = addDays(lastServiceAt, multiplier * unitTime);

    const now = new Date();
    const daysLeft = differenceInCalendarDays(nextServiceAt, now);
    const totalDays = differenceInCalendarDays(nextServiceAt, lastServiceAt);
    const daysLeftPct = clampNegative((daysLeft / totalDays) * 100);

    const valid = await checkCompanyEmployees(companyId, assignees);
    if (!valid) throw new E.ForeignEmployeeError();

    const transaction = await db.transaction();
    try {
        const insertedMaintenance = await EMP.Maintenance.create({
            fk_company_id: companyId,
            fk_equipment_id: equipmentId,
            title,
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

module.exports.insertMaintenanceUpload = async (maintenanceId, equipmentId, createdBy, servicedAt, uploadedFile) => {
    const [isAssigned] = await isAssignedEquipment(equipmentId, createdBy);
    if (!isAssigned) throw new E.PermissionError('upload for maintenance');

    const transaction = await db.transaction();
    try {
        const { file_id } = await insertFile(createdBy, uploadedFile, transaction);

        const insertedMaintenanceUpload = await EMP.MaintenanceUploads.create({
            fk_maintenance_id: maintenanceId,
            fk_file_id: file_id,
            created_by: createdBy,
            serviced_at: servicedAt
        });

        await transaction.commit();
        return insertedMaintenanceUpload;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
