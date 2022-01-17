const {
    insertTraining,
    insertAttendance,
    findTrainingRequests
} = require('../models/com.training');

const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertTraining = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        // approver
        const approvedBy = parseInt(req.body.approved_by);
        if (isNaN(approvedBy))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        const { edit, employee: authorEmployee } = await findRights(createdBy, companyId, MODULE.TRAINING_REQUESTS);
        const { approve, employee: approvingEmployee } = await findRights(approvedBy, companyId, MODULE.TRAINING_REQUESTS);

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        if (!edit) throw new E.PermissionError('edit');
        if (!approve) throw new E.PermissionError('approve');

        const { training_id } = insertTraining({
            ...req.body,
            company_id: companyId,
            created_by: createdBy,
            approved_by: approvedBy
        }, req.upload);

        res.status(201).send(r.success201({ training_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertAttendance = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        await insertAttendance(trainingId, employeeId, companyId, req.upload);

        res.status(201).send(r.success201());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// module.exports.findAllRequests = async (req, res, next) => {
//     try {
//         const { fk_employee_id: employeeId } = res.locals.account;
//         const { companyId } = req.params;

//         const training = await findTrainingRequests.in(companyId);

//         res.status(200).send(r.success200(training));
//         return next();
//     }
//     catch (error) {
//         return next(error);
//     }
// };

// ============================================================

module.exports.findEmployeeRequests = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, employeeId: eid } = req.params;

        // only self can see
        if (eid !== employeeId) throw new E.PermissionError('view training');

        const training = await findTrainingRequests.by(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findPendingRequests = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const training = await findTrainingRequests.pendingFor(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findRequest = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        const training = await findTrainingRequests.one(trainingId, employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

