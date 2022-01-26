const {
    evaluateRecord,
    editRecordEvaluation,
    insertEvaluationTemplate,
    findEvaluationTemplates,
    editEvaluationTemplate,
    activateEvaluationTemplate
} = require('../models/com.trainingEvaluation');

const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.evaluateRecord = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        const record = await evaluateRecord(trainingId, companyId, employeeId);

        res.status(200).send(r.success200(record));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editRecordEvaluation = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        await editRecordEvaluation(trainingId, companyId, employeeId, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertEvaluationTemplate = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(createdBy, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('create training evaluation templates');

        const { evaluation_template_id } = await insertEvaluationTemplate(companyId, createdBy, req.body);

        res.status(201).send(r.success201({ evaluation_template_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findActiveEvalautionTemplate = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('view training evaluation templates');

        const template = await findEvaluationTemplates.active(companyId);

        res.status(200).send(r.success200(template));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEvaluationTemplates = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('view training evaluation templates');

        const templates = await findEvaluationTemplates.all(companyId);

        res.status(200).send(r.success200(templates));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEvaluationTemplate = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, templateId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('view training evaluation templates');

        const template = await findEvaluationTemplates.one(templateId, companyId);
        if (!template) throw new E.NotFoundError('training evlaution template');

        res.status(200).send(r.success200(template));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editEvaluationTemplate = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, templateId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('edit training evaluation templates');

        await editEvaluationTemplate(templateId, companyId, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.activateEvaluationTemplate = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, templateId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.TRAINING_EVALUATION);
        if (!edit) throw new E.PermissionError('edit training evaluation templates');

        await activateEvaluationTemplate(templateId, companyId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
