const { differenceInCalendarDays } = require('date-fns');

const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { PLC }
} = require('../schemas/Schemas');

const { insertFile } = require('./files.v2');
const { deleteFile } = require('../services/cloudinary.v1');

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

const isAssignedLicence = async (licenceId, employeeId) => {
    const count = await PLC.Assignees.count({
        where: {
            fk_licence_id: licenceId,
            fk_employee_id: employeeId
        }
    });
    return count > 0;
};

const clampNegative = (value) => value < 0 ? 0 : value;

module.exports.insertLicence = async (companyId, createdBy, licence = {}) => {
    const {
        licence_name,
        licence_number,
        external_organisation,
        issued_at,
        expires_at = false,
        assignees = []
    } = licence;

    const iat = new Date(issued_at);
    const exp = expires_at ? new Date(expires_at) : null;

    const valid = await companyCheck(companyId, assignees);
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
            fk_company_id: companyId,
            created_by: createdBy,
            licence_name,
            licence_number,
            external_organisation,
            issued_at: iat,
            expires_at: exp,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { transaction });

        const assigneeInsertions = assignees.map((employee_id) => ({
            fk_licence_id: insertedLicence.licence_id,
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

// TODO test me
module.exports.insertRenewalUpload = async (licenceId, companyId, createdBy, renewedAt, upload) => {
    const licence = await PLC.Licences.findOne({
        where: {
            licence_id: licenceId,
            fk_company_id: companyId
        }
    });

    if (!licence) throw new E.NotFoundError('licence');

    const isAssigned = await isAssignedLicence(licence, createdBy);
    if (isAssigned) throw new E.PermissionError('upload renewal for this licence');

    const renewalDate = new Date(renewedAt);

    const existingRenewal = await PLC.Uploads.findOne({
        where: { fk_licence_id: licenceId },
        include: 'file'
    });

    // new renewal replaces old

    await deleteFile(existingRenewal.file.cloudinary_id);
    await Promise.all([
        existingRenewal.destroy(),
        existingRenewal.file.destroy()
    ]);

    const transaction = await db.transaction();
    try {
        const newFile = await insertFile(createdBy, upload, transaction);

        const insertedUpload = await PLC.Uploads.create({
            fk_licence_id: licenceId,
            created_by: createdBy,
            renewed_at: renewalDate,
            fk_file_id: newFile.file_id
        }, { transaction });

        await transaction.commit();
        return insertedUpload;


    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

const $includeAssignees = {
    association: 'assignees',
    include: {
        association: 'account',
        attributes: ['username']
    },
    through: { attributes: [] }
};

const $includeAuthor = {
    association: 'author',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

const $includeUpload = {
    association: 'upload',
    include: {
        association: 'file',
        attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
    }
};

module.exports.findLicence = {
    all: (companyId, includeUploads = false, archivedOnly = false) => {
        const where = {
            fk_company_id: companyId,
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [$includeAuthor, $includeAssignees, $includeUpload]
            : [$includeAuthor, $includeAssignees];

        return PLC.Licences.findAll({ where, include });
    },

    allResponsible: async (employeeId, includeUploads = false, archivedOnly = false) => {
        const joinRows = await PLC.Assignees.findAll({
            where: { fk_employee_id: employeeId }
        });

        const licenceIds = joinRows.map((row) => row.fk_licence_id);

        const where = {
            licence_id: { [Op.or]: licenceIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = includeUploads
            ? [$includeAuthor, $includeAssignees, $includeUpload]
            : [$includeAuthor, $includeAssignees];

        return PLC.Licences.findAll({ where, include });
    },

    one: async (licenceId, companyId, employeeId, includeUploads = true) => {
        const licence = await PLC.Licences.findOne({
            where: {
                licence_id: licenceId,
                fk_company_id: companyId
            },
            include: includeUploads
                ? [$includeAuthor, $includeAssignees, $includeUpload]
                : [$includeAuthor, $includeAssignees]
        });

        if (!licence) throw new E.NotFoundError('licence');

        // removed access restriction to individual licences

        // if (licence.created_by === employeeId) return licence;

        // const isAssigned = await isAssignedLicence(licenceId, employeeId);
        // if (!isAssigned) throw new E.PermissionError('view this licence');

        return licence;
    }
};

// ============================================================

module.exports.editLicence = async (licenceId, companyId, createdBy, licence = {}) => {
    const {
        licence_name,
        licence_number,
        external_organisation,
        expires_at
    } = licence;

    const where = {
        licence_id: licenceId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const [affectedCount] = await PLC.Licences.update({
        licence_name,
        licence_number,
        external_organisation,
        expires_at
    }, { where });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.archiveLicence = async (licenceId, companyId, createdBy) => {
    const where = {
        licence_id: licenceId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const [affectedCount] = await PLC.Licences.update({
        archived_at: new Date()
    }, { where });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.activateLicence = async (licenceId, companyId, createdBy) => {
    const where = {
        licence_id: licenceId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const [affectedCount] = await PLC.Licences.update({
        archived_at: null
    }, { where });

    if (affectedCount === 0) throw new E.NotFoundError('licence');
};

// ============================================================

module.exports.deleteLicence = async (licenceId, companyId, createdBy) => {
    const where = {
        licence_id: licenceId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const licenceCount = await PLC.Licences.count({ where });

    if (licenceCount !== 1) throw new E.NotFoundError('licence');

    // TODO also delete uploads associated with this licence

    const transaction = await db.transaction();
    try {
        await Promise.all([
            PLC.Licences.destroy({
                where, transaction
            }),
            PLC.Assignees.destroy({
                where: { fk_licence_id: licenceId }, transaction
            }),
            PLC.Uploads.destroy({
                where: { fk_licence_id: licenceId }, transaction
            })
        ]);

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

// module.exports.deleteRenewal = async (renewalId, licenceId, createdBy) => {
//     const renewal = PLC.Uploads.findOne({
//         where: {
//             licence_upload_id: renewalId,
//             fk_licence_id: licenceId,
//             created_by: createdBy
//         },
//         include: 'file'
//     });

//     if (!renewal) throw new E.NotFoundError('renewal');

//     await deleteFile();
// };
