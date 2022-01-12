const { differenceInCalendarDays } = require('date-fns');

const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { PLC }
} = require('../schemas/Schemas');

const E = require('../errors/Errors');

// FIXME this should be a common util in separate file
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

const clampNegative = (value) => value < 0 ? 0 : value;

module.exports.insertLicence = async (fk_company_id, created_by, licence = {}) => {
    const {
        licence_name,
        licence_number,
        external_organisation,
        issued_at,
        expires_at = false,
        assignees = []
    } = licence;

    const iat = new Date(issued_at);
    const exp = expires_at ? null : new Date(expires_at);

    const valid = await companyCheck(fk_company_id, assignees);
    if (!valid) throw new E.ForeignEmployeeError();

    let daysLeft = null,
        daysLeftPct = null;

    if (exp !== null) {
        const now = new Date();
        daysLeft = differenceInCalendarDays(exp, now);
        const totalDays = differenceInCalendarDays(exp, iat);
        daysLeftPct = clampNegative((daysLeft / totalDays) * 100);
    }

    const transaction = await db.transaction();
    try {
        const insertedLicence = await PLC.Licences.create({
            fk_company_id,
            created_by,
            licence_name,
            licence_number,
            external_organisation,
            issued_at: iat,
            expires_at: exp,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { transaction });

        const assigneeInsertions = assignees.map((employee_id) => ({
            fk_equipment_id: insertedLicence.licence_id,
            fk_employee_id: employee_id
        }));

        await PLC.Assignees.bulkCreate(assigneeInsertions, { transaction });

        await transaction.commit();
        return insertedLicence;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.insertRenewalUpload = async (fk_company_id, licence_id, created_by, renewed_at, file = {}) => {
    const licence = await PLC.Licences.findOne({
        where: { licence_id, fk_company_id }
    });

    if (!licence) throw new E.NotFoundError('licence');

    const joinCount = await PLC.Assignees.count({
        where: { fk_licence_id: licence_id, fk_employee_id: created_by }
    });

    if (joinCount !== 1) throw new E.PermissionError('upload renewal for this licence');

    const {
        originalname: file_name,
        filename: cloudinary_id,
        path: cloudinary_uri
    } = file;

    const renewalDate = new Date(renewed_at);
    const transaction = await db.transaction();
    try {
        const uploadInsertion = PLC.Uploads.create({
            fk_licence_id: licence_id,
            created_by,
            renewed_at: renewalDate,
            file: {
                file_name,
                cloudinary_id,
                cloudinary_uri,
                created_by
            }
        }, { include: 'file', transaction });

        const licenceUpdate = licence.update({
            last_service_at: renewalDate
        }, { transaction });

        const [insertedUpload] = await Promise.all([uploadInsertion, licenceUpdate]);

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

module.exports.findLicence = {
    all: (fk_company_id, includeUploads = false, archivedOnly = false) => {
        const where = {
            fk_company_id,
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [author, assignees, 'uploads']
            : [author, assignees];

        return PLC.Licences.findAll({ where, include });
    },

    allResponsible: async (fk_employee_id, includeUploads = false, archivedOnly = false) => {
        const joinRows = await PLC.Assignees.findAll({
            where: { fk_employee_id }
        });

        const licenceIds = joinRows.map((row) => row.fk_licence_id);

        const where = {
            equipment_id: { [Op.or]: licenceIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [author, assignees, 'uploads']
            : [author, assignees];

        return PLC.Licences.findAll({ where, include });
    },

    one: async (fk_company_id, licence_id, employee_id, includeUploads) => {
        const licence = await PLC.Licences.findOne({
            where: { equipment_id: licence_id, fk_company_id },
            include: includeUploads
                ? [author, assignees, 'uploads']
                : [author, assignees]
        });

        if (!licence) throw new E.NotFoundError('licence');

        if (licence.created_by === employee_id) return licence;

        const joinCount = await PLC.Assignees.count({
            where: {
                fk_licence_id: licence_id,
                fk_employee_id: employee_id
            }
        });

        if (joinCount !== 1) throw new E.PermissionError('view this licence');

        return licence;
    }
};

// ============================================================

module.exports.editLicence = async (fk_company_id, licence_id, created_by, licence = {}) => {
    const {
        licence_name,
        licence_number,
        external_organisation,
        expires_at
    } = licence;

    const [affectedCount] = await PLC.Licences.update({
        licence_name,
        licence_number,
        external_organisation,
        expires_at
    }, { where: { licence_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.archiveLicence = async (fk_company_id, licence_id, created_by) => {
    const [affectedCount] = await PLC.Licences.update({
        archived_at: new Date()
    }, { where: { equipment_id: licence_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.activateLicence = async (fk_company_id, licence_id, created_by) => {
    const [affectedCount] = await PLC.Licences.update({
        archived_at: null
    }, { where: { equipment_id: licence_id, fk_company_id, created_by } });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.deleteLicence = async (fk_company_id, licence_id, created_by) => {
    const licenceCount = await PLC.Licences.count({
        where: { licence_id, fk_company_id, created_by }
    });

    if (licenceCount !== 1) throw new E.NotFoundError('equipment');

    // TODO also delete uploads associated with this licence

    const transaction = await db.transaction();
    try {
        const destroyed = await Promise.all([
            PLC.Licences.destroy({
                where: { licence_id, fk_company_id, created_by }, transaction
            }),
            PLC.Assignees.destroy({
                where: { fk_licence_id: licence_id }, transaction
            }),
            PLC.Uploads.destroy({
                where: { fk_licence_id: licence_id }, transaction
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
