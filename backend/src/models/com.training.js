const { Sequelize, Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { HR }
} = require('../schemas/Schemas');

const { TRAINING_STATUS } = require('../config/enums');

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
        recommendations,
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
            recommendations,
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
        recommendations,
        justification_text
    });
};

// ============================================================

module.exports.findTrainingRequests = {
    in: (companyId) => HR.TrainingRequests.findAll({
        where: { fk_company_id: companyId }
    }),

    by: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            created_by: employeeId
        }
    }),

    pendingFor: (employeeId, companyId) => HR.TrainingRequests.findAll({
        where: {
            fk_company_id: companyId,
            approved_by: employeeId,
            status: TRAINING_STATUS.PENDING,
            approved_at: null
        }
    }),

    // only the creator and approver can see
    one: (trainingId, employeeId, companyId) => HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            [Op.or]: [
                { created_by: employeeId },
                { approved_by: employeeId, }
            ]
        }
    })
};
