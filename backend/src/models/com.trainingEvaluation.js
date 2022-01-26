const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Documents: { HR }
} = require('../schemas/Schemas');

const {
    includes
} = require('./com.training').helpers;

const { TRAINING_STATUS } = require('../config/enums');

const E = require('../errors/Errors');

module.exports.evaluateRecord = async (trainingId, companyId, employeeId) => {
    const record = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            attendance_upload: { [Op.not]: null },
            [Op.or]: [
                { created_by: employeeId },
                { approved_by: employeeId }
            ]
        },
        include: Object.values(includes)
    });

    if (!record) throw new E.NotFoundError('training record');

    // the training record already has evaluation cloned from template
    // do not overwrite the evaluation
    if (record.evaluation) return record;

    const trainingEvaluation = await HR.TrainingEvaluationTemplates.findOne({
        where: {
            fk_company_id: companyId,
            active: true
        },
        attributes: ['template']
    });

    if (!trainingEvaluation) throw new E.NotFoundError('an active training evaluation form in the company');

    const { template } = trainingEvaluation;
    const now = new Date();

    template.meta.form = {
        trainee_id: record.created_by,
        supervisor_id: record.approved_by,
        created_at: now
    };

    const updatedRecord = await record.update({
        evaluation: template
    });

    return updatedRecord;
};

// ============================================================

module.exports.editRecordEvaluation = async (trainingId, companyId, employeeId, data = {}) => {
    const record = await HR.TrainingRequests.findOne({
        where: {
            training_id: trainingId,
            fk_company_id: companyId,
            attendance_upload: { [Op.not]: null },
            [Op.or]: [
                { created_by: employeeId },
                { approved_by: employeeId }
            ]
        },
        attributes: [
            'training_id',
            'fk_company_id',
            'created_by',
            'approved_by',
            'evaluation'
        ]
    });

    const template = record.toJSON().evaluation;

    const isCreator = record.created_by === employeeId;
    const isApprover = record.approved_by === employeeId;

    if (isCreator && data.trainee)
        template.evaluation.trainee = data.trainee;

    if (isApprover && data.supervisor)
        template.evaluation.supervisor = data.supervisor;

    // undefined to sequelize means no change
    await record.update({
        evaluation: template,
        trainee_evaluation_done: isCreator
            ? data.trainee_evaluation_done
            : undefined,
        supervisor_evaluation_done: isApprover
            ? data.supervisor_evaluation_done
            : undefined
    });
};

// ============================================================

// see format in doc/Clause 7/trainingEvaluation.js
module.exports.insertEvaluationTemplate = async (companyId, createdBy, data = {}) => {
    const {
        name,
        version,
        evaluation,         // expects object[] in evaluation.trainee and evaluation.supervisor
        immediate = false   // whether the template becomes active template immediately
    } = data;

    // check for duplicate versioning
    // case insensitive
    const count = await HR.TrainingEvaluationTemplates.count({
        where: {
            fk_company_id: companyId,
            version
        }
    });
    if (count) throw new E.DuplicateError('training evalauation template', 'version');

    const now = new Date();

    const template = {
        meta: {
            template: {
                name,
                version,
                created_by: createdBy,
                created_at: now // will definitely not be the same as the row
            }
        },
        evaluation
    };

    let transaction;
    try {
        if (immediate) {
            transaction = await db.transaction();

            const where = {
                fk_company_id: companyId,
                active: true
            };

            // deactivate any existing templates
            await HR.TrainingEvaluationTemplates.update({
                active: false
            }, { where, transaction });
        }

        const trainingEvaluation = await HR.TrainingEvaluationTemplates.create({
            fk_company_id: companyId,
            created_by: createdBy,
            name,
            version,
            template,
            active: immediate
        }, { transaction });

        await transaction?.commit();
        return trainingEvaluation;
    }
    catch (error) {
        await transaction?.rollback();
        throw error;
    }
};

// ============================================================

const $includeAuthor = {
    association: 'author',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

// ============================================================

module.exports.findEvaluationTemplates = {
    all: (companyId) => HR.TrainingEvaluationTemplates.findAll({
        where: { fk_company_id: companyId },
        include: $includeAuthor
    }),

    one: (templateId, companyId) => HR.TrainingEvaluationTemplates.findOne({
        where: {
            evaluation_template_id: templateId,
            fk_company_id: companyId
        },
        include: $includeAuthor
    }),

    active: (companyId) => HR.TrainingEvaluationTemplates.findOne({
        where: {
            fk_company_id: companyId,
            active: true
        },
        include: $includeAuthor
    })
};

// ============================================================

// anyone with rights to edit
// can edit any template (including those that are not theirs)
module.exports.editEvaluationTemplate = async (templateId, companyId, data = {}) => {
    const {
        name,
        version,
        evaluation      // send everything like in insert
    } = data;

    const trainingEvaluation = await HR.TrainingEvaluationTemplates.findOne({
        where: {
            evaluation_template_id: templateId,
            fk_company_id: companyId
        }
    });
    if (!trainingEvaluation) throw new E.NotFoundError('training evaluation template');

    const template = { ...trainingEvaluation.template, evaluation };

    await trainingEvaluation.update({ name, version, template });
};

// ============================================================

module.exports.activateEvaluationTemplate = async (templateId, companyId) => {
    const transaction = await db.transaction();
    try {
        const whereToBeActive = {
            evaluation_template_id: templateId,
            fk_company_id: companyId,
            active: false
        };

        const toBeActive = await HR.TrainingEvaluationTemplates.findOne({
            where: whereToBeActive,
            attributes: ['evaluation_template_id']
        });
        if (!toBeActive) throw new E.NotFoundError('training evaluation template');

        const whereCurrentActive = {
            fk_company_id: companyId,
            active: true
        };

        await HR.TrainingEvaluationTemplates.update({
            active: false
        }, { where: whereCurrentActive, transaction });

        await toBeActive.update({ active: true }, { transaction });
        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
