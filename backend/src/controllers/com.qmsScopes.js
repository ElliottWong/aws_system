const Yup = require('yup');

const {
    insertQmsScope,
    findBlockingQmsScope,
    findQmsScopes,
    deleteQmsScope
} = require('../models/com.qmsScopes');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const now = new Date();   

// CREATE

module.exports.insertQmsScope = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const existingBlock = await findBlockingQmsScope(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError(
                    'QMS scope document',
                    DOCUMENT_STATUS.PENDING
                );

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError(
                    'QMS scope document',
                    DOCUMENT_STATUS.REJECTED
                );

            // the new form is from the same employee that has a rejected form
            await existingBlock.destroy({ force: true });
        }

        // approver
        const approved_by = parseInt(req.body.approved_by);
        if (isNaN(approved_by))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        // check author for edit rights
        const { edit, employee: authorEmployee } = await findRights(
            created_by,
            companyId,
            'm04_03'
        );
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(
            approved_by,
            companyId,
            'm04_03'
        );
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        // data from request body
        const { title, content, boundaries = [] } = req.body;

        const { qms_scope_id, status } = await insertQmsScope({
            companyId,
            created_by,
            approved_by,
            title,
            content,
            boundaries
        });

        // Send email to the approver
        const emailContent = templates.documentSendApproval(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Scope of QMS',
            `${now}`,
            'scope-of-qms',
            'Scope of QMS'
        );

        sendEmail(
            approvingEmployee.email,
            'Scope of QMS document requires your approval',
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

        res.status(201).send(r.success200({ qms_scope_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllQmsScopes = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findQmsScopes({
            where: { fk_company_id: companyId },
            includeItems: false
        });
        const results = forms.length === 0 ? undefined : forms;

        res.status(200).send(r.success200(results));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findQmsScopeById = async (req, res, next) => {
    try {
        const { companyId, qmsId } = req.params;

        const found = await findQmsScopes({
            where: {
                fk_company_id: companyId,
                qms_scope_id: qmsId
            },
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('QMS Scope');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findQmsScopeByStatus = async (req, res, next) => {
    try {
        const { companyId, status } = req.params;

        const validStatus = testEnum(DOCUMENT_STATUS, status);
        if (!validStatus) throw new E.ParamValueError('status');

        const search = {
            where: { fk_company_id: companyId, status },
            limit: 1,
            includeItems: true
        };

        let results;

        if (status === DOCUMENT_STATUS.ARCHIVED) {
            // database query limit and offset
            const { limit, offset } = req.query;

            const limitSchema = Yup.number().positive().integer().min(1).default(3);
            const offsetSchema = Yup.number().positive().integer().min(0).default(0);

            search.limit = await limitSchema.validate(limit).catch(() => {
                throw new E.ParamValueError('limit');
            });

            search.offset = await offsetSchema.validate(offset).catch(() => {
                throw new E.ParamValueError('offset');
            });

            search.includeItems = false;

            results = await findQmsScopes(search);
        }
        else {
            [results] = await findQmsScopes(search);
        }

        res.status(200).send(r.success200(results));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// UPDATE

module.exports.rejectQmsScope = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, qmsId } = req.params;

        // check for permission for reject
        const { approve, employee: rejectingEmployee } = await findRights(
            rejected_by,
            companyId,
            'm04_03'
        );
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findQmsScopes({
            where: {
                fk_company_id: companyId,
                qms_scope_id: qmsId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('QMS Scope');

        const { remarks } = req.body;
        await toBeRejected.update({
            remarks,
            status: DOCUMENT_STATUS.REJECTED
        });

        // authors
        const created_by = parseInt(toBeRejected.created_by);
        if (isNaN(created_by))
            throw new E.ParamTypeError('created_by', req.body.created_by, 1);

        // check authors for appove rights
        const { employee: authorEmployee } = await findRights(
            created_by,
            companyId,
            'm04_03'
        );

        // Send email to the author
        const emailContent = templates.documentRejected(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            'Scope of QMS',
            `${now}`,
            `${remarks}`,
            'scope-of-qms',
            'Scope of QMS'
        );

        sendEmail(
            authorEmployee.email,
            'Scope of QMS document have been rejected',
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

module.exports.approveQmsScope = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, qmsId } = req.params;

        // check for permission for approve
        const { approve, employee: approverEmployee } = await findRights(approved_by, companyId, 'm04_03');
        if (!approve) throw new E.PermissionError('approve');

        // find the to be approved qms scope
        const [toBeApproved] = await findQmsScopes({
            where: {
                fk_company_id: companyId,
                qms_scope_id: qmsId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('QMS Scope');

        // find the active qms scope
        const [currentActive] = await findQmsScopes({
            where: {
                fk_company_id: companyId,
                status: DOCUMENT_STATUS.ACTIVE
            },
            limit: 1,
            includeItems: false
        });

        await currentActive?.update({
            status: DOCUMENT_STATUS.ARCHIVED,
            expired_at: new Date()
        });

        try {
            await toBeApproved.update({
                status: DOCUMENT_STATUS.ACTIVE,
                approved_at: new Date()
            });
        }
        catch (error) {
            // if for some reason fail to update
            // pending form to become active
            // reverse change on active qms scope
            await currentActive?.update({
                status: DOCUMENT_STATUS.ACTIVE,
                expired_at: null
            });
            throw error;
        }

        // authors
        const created_by = parseInt(toBeApproved.created_by);
        if (isNaN(created_by))
            throw new E.ParamTypeError('created_by', req.body.created_by, 1);

        // check authors for approve rights
        const { employee: authorEmployee } = await findRights(
            created_by,
            companyId,
            'm04_03'
        );

        // Send email to the author
        const emailContent = templates.documentApproval(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${approverEmployee.firstname} ${approverEmployee.lastname}`,
            'Scope of QMS',
            `${now}`,
            'scope-of-qms',
            'Scope of QMS'
        );

        sendEmail(
            authorEmployee.email,
            'Scope of QMS document have been approved',
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

// DELETE

module.exports.deleteQmsScope = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, qmsId } = req.params;

        const [toBeDeleted] = await findQmsScopes({
            where: (Op) => ({
                fk_company_id: companyId,
                qms_scope_id: qmsId,
                status: {
                    [Op.in]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED]
                }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('QMS Scope');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError(
                    'Cannot delete another employee\'s rejected document'
                );
            await deleteQmsScope(companyId, qmsId, true);
        }
        else {
            const { approve } = await findRights(deleted_by, companyId, 'm04_03');
            if (!approve) throw new E.PermissionError('delete');
            await deleteQmsScope(companyId, qmsId, false);
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
