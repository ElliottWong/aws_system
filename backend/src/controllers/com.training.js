const {
    insertTrainingRequest,
    insertAttendance,
    findTraining,
    editRequest,
    rejectRequest,
    approveRequest,
    cancelRequestOrRecord,
    deleteRejectedRequest
} = require('../models/com.training');


const {
    Documents: { HR }
} = require('../schemas/Schemas');


const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const { parseBoolean } = require('../utils/request');
const { sendEmail, templates } = require('../services/email');
const now = new Date();
const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertTrainingRequest = async (req, res, next) => {
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

        if (!edit) throw new E.PermissionError('create');
        if (!approve) throw new E.PermissionError('approve');

        const { training_id } = await insertTrainingRequest({
            ...req.body,
            company_id: companyId,
            created_by: createdBy,
            approved_by: approvedBy
        }, req.upload);



        // Send email to the approver
        const emailContent = templates.documentSendApprovalTraining(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `<p>Title: ${req.body.title}</p>
            <p>Training start: ${req.body.training_start}</p>
            <p>Training end: ${req.body.training_end}</p>
            <p>Training institution: ${req.body.training_institution}</p>
            <p>Training cost: ${req.body.training_cost}</p>
            <p>Justification text: ${req.body.justification_text}</p>
            `,
            `training/manage/requests/manage/${training_id}`,
            'Training Requests',
        );

         sendEmail(
             approvingEmployee.email,
             'An training requests requires your approval',
             emailContent
         ).catch((error) =>
             console.log(`Non-fatal: Failed to send email\n${error}`)
         );

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

//         const { approve } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);
//         if (!approve) throw new E.PermissionError('cannot view all training requests');

//         const trainingRequests = await findTraining.requestsIn(companyId);

//         res.status(200).send(r.success200(trainingRequests));
//         return next();
//     }
//     catch (error) {
//         return next(error);
//     }
// };

// ============================================================

// module.exports.findAllRecords = async (req, res, next) => {
//     try {
//         const { fk_employee_id: employeeId } = res.locals.account;
//         const { companyId } = req.params;

//         const { approve } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);
//         if (!approve) throw new E.PermissionError('cannot view all training records');

//         const trainingRecords = await findTraining.recordsIn(companyId);

//         res.status(200).send(r.success200(trainingRecords));
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

        const training = await findTraining.requestsBy(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEmployeeRecords = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, employeeId: eid } = req.params;

        // only self can see
        if (eid !== employeeId) throw new E.PermissionError('view training');

        const training = await findTraining.recordsBy(employeeId, companyId);

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

        const training = await findTraining.requestsPendingFor(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findRejectedRequests = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const training = await findTraining.requestsRejectedBy(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findApprovedRecords = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const training = await findTraining.recordsApprovedBy(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllApprovedBy = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const training = await findTraining.allApprovedBy(employeeId, companyId);

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findRequestOrRecord = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        const training = await findTraining.requestOrRecord(trainingId, companyId, employeeId);
        if (!training) throw new E.NotFoundError('training request or record');

        res.status(200).send(r.success200(training));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.rejectRequest = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        const { remarks } = req.body;
        await rejectRequest(trainingId, companyId, employeeId, remarks);

        //ok
        const { employee: rejectingEmployee } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);


        //ok
        const { employee: authorEmployee } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);


        // Send email to the approver
        const emailContent = templates.documentRejectedTraining(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            `${remarks}`,
            /*   `<p>Title: ${req.body.title}</p>
                <p>Training start: ${req.body.training_start}</p>
                <p>Training end: ${req.body.training_end}</p>
                <p>Training institution: ${req.body.training_institution}</p>
                <p>Training cost: ${req.body.training_cost}</p>
               <p>Justification text: ${req.body.justification_text}</p>
              `, */
            `training/manage/requests/manage/${trainingId}`,
            'Training Requests',
        );

        sendEmail(
            authorEmployee.email,
            'Training requests have been rejected',
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.approveRequest = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        await approveRequest(trainingId, companyId, employeeId);

        const { employee: rejectingEmployee } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);


        //ok
        const { employee: authorEmployee } = await findRights(employeeId, companyId, MODULE.TRAINING_REQUESTS);


        // Send email to the approver
        const emailContent = templates.documentApprovalTraining(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            /*   `<p>Title: ${req.body.title}</p>
                <p>Training start: ${req.body.training_start}</p>
                <p>Training end: ${req.body.training_end}</p>
                <p>Training institution: ${req.body.training_institution}</p>
                <p>Training cost: ${req.body.training_cost}</p>
               <p>Justification text: ${req.body.justification_text}</p>
              `, */
            `training/manage/requests/manage/${trainingId}`,
            'Training Requests'
        );

        sendEmail(
            authorEmployee.email,
            'Training requests have been approved',
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );






        res.status(200).send(r.success200());
        return next();

    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.cancelRequestOrRecord = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        await cancelRequestOrRecord(trainingId, companyId, employeeId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editRequest = async (req, res, next) => { };

// ============================================================

module.exports.deleteRejectedRequest = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, trainingId } = req.params;

        await deleteRejectedRequest(trainingId, companyId, employeeId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
