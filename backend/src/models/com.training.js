const { Sequelize, Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { HR }
} = require('../schemas/Schemas');

const { TRAINING_STATUS } = require('../config/enums');

const { insertFile } = require('./files.v2');

const E = require('../errors/Errors');

const isRequestAuthor = async (trainingId, employeeId, companyId) => {
    const count = await HR.TrainingRequests.count({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            created_by: employeeId
        }
    });

    return count === 1;
};

// ============================================================

module.exports.insertTraining = (data = {}, upload) => {
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
    const isAuthor = isRequestAuthor(trainingId, employeeId, companyId);
    if (!isAuthor) throw new E.NotFoundError('training request');

    const { file_id } = await insertFile(employeeId, upload);

    const where = {
        training_id: trainingId,
        fk_company_id: companyId,
        created_by: employeeId
    };

    await HR.TrainingRequests.update({ attendance_upload: file_id }, { where });
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

// KISS (keep it simple stupid) - no config for now

module.exports.findTraining = {
    requestsIn: (companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            status: { [Op.not]: TRAINING_STATUS.APPROVED }
        },
        include: allIncludes
    }),

    recordsIn: (companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            status: TRAINING_STATUS.APPROVED,       // approved
            attendance_upload: { [Op.not]: null }   // and has attendance
        },
        include: allIncludes
    }),

    requestsBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            created_by: employeeId,
            status: { [Op.not]: TRAINING_STATUS.APPROVED }
        },
        include: allIncludes
    }),

    // records are subset of requests
    recordsBy: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            created_by: employeeId,
            status: TRAINING_STATUS.APPROVED,       // approved
            attendance_upload: { [Op.not]: null }   // and has attendance
        },
        include: allIncludes
    }),

    requestsPendingFor: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            status: TRAINING_STATUS.PENDING,
            approved_at: null
        },
        include: allIncludes
    }),

    // only the creator and approver can see
    request: (trainingId, employeeId, companyId) => HR.TrainingRequests.findOne({
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

module.exports.editTrainingRequest = async () => {

};

// ============================================================

module.exports.deleteTrainingRequest = async () => {

};
