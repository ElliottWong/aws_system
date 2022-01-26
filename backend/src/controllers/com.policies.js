const Yup = require('yup');

const {
    insertPolicy,
    findBlockingPolicy,
    findPolicies,
    deletePolicy
} = require('../models/com.policies');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const r = require('../utils/response').responses;
const E = require('../errors/Errors');

const now = new Date();   

// CREATE

module.exports.insertPolicy = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const existingBlock = await findBlockingPolicy(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError('policy', DOCUMENT_STATUS.PENDING);

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError('policy', DOCUMENT_STATUS.REJECTED);

            // the new form is from the same employee that has a rejected form
            await existingBlock.destroy({ force: true });
        }

        // approver
        const approved_by = parseInt(req.body.approved_by);
        if (isNaN(approved_by))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        // check author for edit rights
        const { edit, employee: authorEmployee } = await findRights(created_by, companyId, 'm05_02');
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(approved_by, companyId, 'm05_02');
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        const { title, policies = [] } = req.body;

        const { policy_id, status } = await insertPolicy({
            companyId,
            created_by, approved_by,
            title, policies
        });

        // Send email to the approver
        const emailContent = templates.documentSendApproval(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Company Policy',
            `${now}`,
            'company-policy',
            'Company Policy'
        );

        sendEmail(approvingEmployee.email, 'Company Policy document requires your approval', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(201).send(r.success201({ policy_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllPolicy = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findPolicies({
            where: { fk_company_id: companyId },
            includeItems: false
        });

        res.status(200).send(r.success200(forms));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findPolicyById = async (req, res, next) => {
    try {
        const { companyId, policyId } = req.params;

        const [found] = await findPolicies({
            where: {
                fk_company_id: companyId,
                policy_id: policyId
            },
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('policy');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findPolicyByStatus = async (req, res, next) => {
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

            search.limit = await limitSchema.validate(limit)
                .catch(() => {
                    throw new E.ParamValueError('limit');
                });

            search.offset = await offsetSchema.validate(offset)
                .catch(() => {
                    throw new E.ParamValueError('offset');
                });

            search.includeItems = false;

            results = await findPolicies(search);
        }
        else {
            [results] = await findPolicies(search);
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

module.exports.rejectPolicy = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, policyId } = req.params;

        // check for permission for reject
        const { approve, employee: rejectingEmployee } = await findRights(rejected_by, companyId, 'm05_02');
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findPolicies({
            where: {
                fk_company_id: companyId,
                policy_id: policyId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('policy');

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
            'm05_02'
        );

        // Send email to the author
        const emailContent = templates.documentRejected(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            'Company Policy',
            `${now}`,
            `${remarks}`,
            'company-policy',
            'Company Policy'
        );

        sendEmail(
            authorEmployee.email,
            'Company Policy document have been rejected',
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

module.exports.approvePolicy = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, policyId } = req.params;

        // check for permission for approve
        const { approve, employee: approverEmployee } = await findRights(approved_by, companyId, 'm05_02');
        if (!approve) throw new E.PermissionError('approve');

        // find the to be approved qms scope
        const [toBeApproved] = await findPolicies({
            where: {
                fk_company_id: companyId,
                policy_id: policyId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('policy');

        // find the active qms scope
        const [currentActive] = await findPolicies({
            where: {
                fk_company_id: companyId,
                status: DOCUMENT_STATUS.ACTIVE
            },
            limit: 1,
            includeItems: false
        });

        // there may be a case where the company has no active qms scope
        // such as when the company is new
        // this may not be the actual case but i have not
        // done the part for creating new companies (completely)

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
            'm05_02'
        );

        // Send email to the author
        const emailContent = templates.documentApproval(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${approverEmployee.firstname} ${approverEmployee.lastname}`,
            'Company Policy',
            `${now}`,
            'company-policy',
            'Company Policy'
        );

        sendEmail(
            authorEmployee.email,
            'Company Policy document have been approved',
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

module.exports.deletePolicy = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, policyId } = req.params;

        const [toBeDeleted] = await findPolicies({
            where: (Op) => ({
                policy_id: policyId,
                fk_company_id: companyId,
                // only can delete archived/rejected forms
                status: { [Op.in]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED] }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('policy');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            // if the person deleting this rejected document is not its author
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError('Cannot delete another employee\'s rejected document');
            await deletePolicy(companyId, policyId, true);
        }
        else {
            const { approve } = await findRights(deleted_by, companyId, 'm05_02');
            if (!approve) throw new E.PermissionError('delete');
            await deletePolicy(companyId, policyId, false);
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
