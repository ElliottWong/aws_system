const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Documents: { HR }
} = require('../schemas/Schemas');

const { TRAINING_STATUS } = require('../config/enums');

const { insertFile, deleteFileEntirely } = require('./files.v2');

const E = require('../errors/Errors');

const isRequestAuthor = async (trainingId, employeeId, companyId) => {
    const request = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            created_by: employeeId
        }
    });

    return [!!request, request];
};

// ============================================================

module.exports.insertTrainingRequest = (data = {}, upload) => {
    const {
        company_id,
        created_by,
        approved_by,
        title,
        training_start,
        training_end,
        training_institution,
        training_cost,
        justification_text
    } = data;

    // if there is no file uploaded, upload is undef
    if (upload) {
        const {
            originalname: file_name,
            filename: cloudinary_id,
            path: cloudinary_uri
        } = upload;

        const justification_file = {
            file_name,
            cloudinary_id,
            cloudinary_uri,
            created_by
        };

        return HR.TrainingRequests.create({
            fk_company_id: company_id,
            created_by: created_by,
            approved_by: approved_by,
            status: TRAINING_STATUS.PENDING,
            title,
            training_start,
            training_end,
            training_institution,
            training_cost,
            justification_text,
            justification_file
        }, { include: 'justification_file' });
    }

    // without a justification file upload
    return HR.TrainingRequests.create({
        fk_company_id: company_id,
        created_by: created_by,
        approved_by: approved_by,
        status: TRAINING_STATUS.PENDING,
        title,
        training_start,
        training_end,
        training_institution,
        training_cost,
        justification_text
    });
};

// ============================================================

module.exports.insertAttendance = async (trainingId, employeeId, companyId, upload) => {
    const [isAuthor, request] = await isRequestAuthor(trainingId, employeeId, companyId);
    if (!isAuthor) throw new E.NotFoundError('training request');

    // request not approved
    if (request.approved_at === null)
        throw new E.DocumentStatusError('training request');

    // new attendance upload for record
    if (request.attendance_upload === null) {
        const transaction = await db.transaction();
        try {
            const { file_id } = await insertFile(employeeId, upload, transaction);

            await request.update({
                attendance_upload: file_id
            }, { transaction });

            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
        return;
    }

    // otherwise replace old attendance file with new

    // cannot change attendance file once eval starts
    const isEvalStarted = request.trainee_evaluation !== null || request.supervisor_evaluation !== null;
    if (isEvalStarted) throw new E.DocumentValueError('training record', 'begun evaluation');

    const oldFileId = request.attendance_upload;

    const transaction = await db.transaction();
    try {
        const { file_id } = await insertFile(employeeId, upload, transaction);

        await request.update({
            attendance_upload: file_id
        }, { transaction });

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }

    // TODO better error handling
    await deleteFileEntirely(oldFileId)
        .catch((e) => console.log(`FILE DELETE FAILED BUT IGNORED - FILE ID ${oldFileId}`, e));
};

// ============================================================

const $includeAuthor = {
    association: 'author',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

const $includeApprover = {
    association: 'approver',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

const $includeJustificationFile = {
    association: 'justification_file',
    attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
};

const $includeAttendanceFile = {
    association: 'attendance_file',
    attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
};

const allIncludes = [$includeAuthor, $includeApprover, $includeJustificationFile, $includeAttendanceFile];

module.exports.helpers = {
    includes: {
        author: $includeAuthor,
        approver: $includeApprover,
        justificationFile: $includeJustificationFile,
        attendanceFile: $includeAttendanceFile
    }
};

// ============================================================

// KISS (keep it simple, stupid) - no configs for now
module.exports.findTraining = {
    requestsIn: (companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_at: null
        },
        include: allIncludes
    }),

    recordsIn: (companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_at: { [Op.not]: null }
        },
        include: allIncludes
    }),

    // gets requests/records
    requestsBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            created_by: employeeId
        },
        include: allIncludes
    }),

    // records are subset of requests
    // they are requests that were approved
    // approved_at is NOT null once approved, so it is like a bool
    recordsBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            created_by: employeeId,
            approved_at: { [Op.not]: null }
        },
        include: allIncludes
    }),

    // approver wont see pending but cancelled requests
    requestsPendingFor: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            status: TRAINING_STATUS.PENDING,
            approved_at: null
        },
        include: allIncludes
    }),

    requestsRejectedBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            status: TRAINING_STATUS.REJECTED,
            approved_at: null
        },
        include: allIncludes
    }),

    // approver can see approved and approved but cancelled records
    recordsApprovedBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            approved_at: { [Op.not]: null }
        },
        include: allIncludes
    }),

    // all requests where approved_by
    allApprovedBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            status: { [Op.not]: TRAINING_STATUS.CANCELLED }
        },
        include: allIncludes
    }),

    // only the creator and approver can see
    // can be request/record
    requestOrRecord: (trainingId, companyId, employeeId) => HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            [Op.or]: [
                { created_by: employeeId },
                { approved_by: employeeId }
            ]
        },
        include: allIncludes
    })
};

// ============================================================

module.exports.editRequest = async (trainingId, companyId, createdBy, training = {}) => {

};

// ============================================================

module.exports.rejectRequest = async (trainingId, companyId, approvedBy, remarks) => {
    const toBeRejected = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            approved_by: approvedBy,
            status: TRAINING_STATUS.PENDING
        }
    });
    if (!toBeRejected) throw new E.NotFoundError('training request');

    const rejected = await toBeRejected.update({
        status: TRAINING_STATUS.REJECTED,
        remarks
    });

    return rejected;
};

// ============================================================

module.exports.approveRequest = async (trainingId, companyId, approvedBy) => {
    const toBeApproved = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            approved_by: approvedBy,
            status: TRAINING_STATUS.PENDING
        }
    });
    if (!toBeApproved) throw new E.NotFoundError('training request');

    const now = new Date();

    const approved = await toBeApproved.update({
        status: TRAINING_STATUS.APPROVED,
        approved_at: now
    });

    return approved;
};

// ============================================================

module.exports.cancelRequestOrRecord = async (trainingId, companyId, createdBy) => {
    const toBeCancelled = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            created_by: createdBy,
            // should not cancel a rejected request
            // also does not make sense to cancel an already cancelled item
            status: { [Op.in]: [TRAINING_STATUS.APPROVED, TRAINING_STATUS.PENDING] },
            attendance_upload: null
        }
    });
    if (!toBeCancelled) throw new E.NotFoundError('training request');

    const cancelled = await toBeCancelled.update({
        status: TRAINING_STATUS.CANCELLED
    });

    return cancelled;
};

// ============================================================

// only applicable to rejected requests
module.exports.deleteRejectedRequest = async (trainingId, companyId, createdBy) => {
    const toBeDestroyed = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            created_by: createdBy,
            status: TRAINING_STATUS.REJECTED
        }
    });
    if (!toBeDestroyed) throw new E.NotFoundError('training request');

    if (toBeDestroyed.justification_upload !== null) {
        await deleteFileEntirely(toBeDestroyed.justification_upload);
        // there is no attendance file to delete
    }

    await toBeDestroyed.destroy();
};
