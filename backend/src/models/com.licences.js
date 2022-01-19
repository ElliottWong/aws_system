const { differenceInCalendarDays } = require('date-fns');

const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { PLC }
} = require('../schemas/Schemas');

const { insertFile, deleteFileEntirely } = require('./files.v2');
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

const isLicenceOwner = async (licenceId, companyId, employeeId) => {
    const licence = await PLC.Licences.findOne({
        where: {
            licence_id: licenceId,
            fk_company_id: companyId,
            created_by: employeeId
        }
    });
    return [!!licence, licence];
};

// null in formdata is likely a string
const parseNull = (value) => value === 'null' ? null : value;

const clampNegative = (value) => value < 0 ? 0 : value;

const calculateFrequency = (start, end) => {
    const issuedAt = new Date(start);

    if (!end) {
        const expiresAt = null, daysLeft = null, daysLeftPct = null;
        return { issuedAt, expiresAt, daysLeft, daysLeftPct };
    }

    const expiresAt = new Date(end);
    const now = new Date();

    const daysLeft = differenceInCalendarDays(expiresAt, now);
    const totalDays = differenceInCalendarDays(expiresAt, issuedAt);
    const daysLeftPct = clampNegative((daysLeft / totalDays) * 100);

    return { issuedAt, expiresAt, daysLeft, daysLeftPct };
};

// ============================================================

module.exports.insertLicence = async (companyId, createdBy, licence = {}) => {
    const {
        licence_name,
        licence_number,
        external_organisation,
        issued_at,
        expires_at = false,
        assignees = []
    } = licence;

    const valid = await companyCheck(companyId, assignees);
    if (!valid) throw new E.ForeignEmployeeError();

    const {
        issuedAt,
        expiresAt,
        daysLeft,
        daysLeftPct
    } = calculateFrequency(issued_at, expires_at);

    const transaction = await db.transaction();
    try {
        const insertedLicence = await PLC.Licences.create({
            fk_company_id: companyId,
            created_by: createdBy,
            licence_name,
            licence_number,
            external_organisation,
            issued_at: issuedAt,
            expires_at: expiresAt,
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
module.exports.insertRenewalUpload = async (licenceId, companyId, createdBy, dates = {}, upload) => {
    const licence = await PLC.Licences.findOne({
        where: {
            licence_id: licenceId,
            fk_company_id: companyId
        }
    });

    if (!licence) throw new E.NotFoundError('licence');

    const isAssigned = await isAssignedLicence(licenceId, createdBy);
    if (!isAssigned) throw new E.PermissionError('upload renewal for this licence');

    const existingRenewal = await PLC.Uploads.findOne({
        where: { fk_licence_id: licenceId }
    });

    // expires_at defaults to false
    // means not provided by request
    const { issued_at, expires_at = false } = dates;

    const start = parseNull(issued_at) || licence.issued_at;
    const end = expires_at === false
        ? licence.expires_at // use existing value
        : parseNull(expires_at); // a value is provided in request, use that

    const {
        issuedAt,
        expiresAt,
        daysLeft,
        daysLeftPct
    } = calculateFrequency(start, end);

    const transaction = await db.transaction();
    try {
        const { file_id } = await insertFile(createdBy, upload, transaction);

        const updateLicence = licence.update({
            issued_at: issuedAt,
            expires_at: expiresAt,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        }, { transaction });

        const updateRenewal = existingRenewal
            // if there is an existing row
            ? existingRenewal.update({
                fk_file_id: file_id,
                created_by: createdBy,
                issued_at: issuedAt,
                expires_at: expiresAt
            }, { transaction })
            // else create a new one
            : PLC.Uploads.create({
                fk_licence_id: licence.licence_id,
                fk_file_id: file_id,
                created_by: createdBy,
                issued_at: issuedAt,
                expires_at: expiresAt
            }, { transaction });

        await Promise.all([updateLicence, updateRenewal]);

        // delete old file
        if (existingRenewal) {
            await deleteFileEntirely(existingRenewal.fk_file_id);
        }

        await transaction.commit();
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
        issued_at,
        expires_at = false, // undef from request -> false
        assignees = []
    } = licence;

    const [isOwner, found] = await isLicenceOwner(licenceId, companyId, createdBy);
    if (!isOwner) throw new E.NotFoundError('licence');

    const start = issued_at || found.issued_at;
    const end = expires_at === false
        ? found.expires_at // use existing value
        : expires_at; // a value is provided in request, use that

    const {
        issuedAt,
        expiresAt,
        daysLeft,
        daysLeftPct
    } = calculateFrequency(start, end);

    const transaction = await db.transaction();
    try {
        await found.update({
            licence_name,
            licence_number,
            external_organisation,
            issued_at: issuedAt,
            expires_at: expiresAt,
            days_left: daysLeft,
            days_left_pct: daysLeftPct
        });

        if (assignees.length > 0) {
            await PLC.Assignees.destroy({
                where: { fk_licence_id: licenceId },
                transaction
            });

            const assigneeInsertions = assignees.map((employeeId) => ({
                fk_licence_id: licenceId,
                fk_employee_id: employeeId
            }));

            await PLC.Assignees.bulkCreate(assigneeInsertions, { transaction });
        }

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
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
