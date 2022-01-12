const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { Training, HR }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');


module.exports.createTraining = (data = {}) => {
    const {
        companyId: fk_company_id,
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

    return HR.TrainingRequests.create({
        fk_company_id,
        title, created_by, approved_by,
        training_start,
        training_end,
        training_institution,
        training_cost,
        recommendations,
        justification_text,
        status: DOCUMENT_STATUS.PENDING
    });
};
