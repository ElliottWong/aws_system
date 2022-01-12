const Yup = require('yup');

const {
    insertSwot,
    findBlockingSwot,
    findSwots,
    deleteSwot
} = require('../models/com.swots');

const { matchActiveSwot } = require('../models/com.risksAnalyses');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertSwot = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        // check if a pending swot or rejected swot already exists
        const existingBlock = await findBlockingSwot(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError('SWOT', DOCUMENT_STATUS.PENDING);

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError('SWOT', DOCUMENT_STATUS.REJECTED);

            // the new form is from the same employee that has a rejected form
            await existingBlock.destroy({ force: true });
        }

        // approver
        const approved_by = parseInt(req.body.approved_by);
        if (isNaN(approved_by))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        // check author for edit rights
        const { edit, employee: authorEmployee } = await findRights(created_by, companyId, 'm04_01');
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(approved_by, companyId, 'm04_01');
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        const { swot_id, status } = await insertSwot({ companyId, ...req.body, created_by, approved_by });

        const emailContent = templates.documentApproval(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Policies',
            `${authorEmployee.firstname} ${authorEmployee.lastname}`
        );

        sendEmail(approvingEmployee.email, 'A document requires your approval', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(201).send(r.success201({ swot_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

// shallow swots, does not include items
module.exports.findAllSwots = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findSwots({
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

module.exports.findSwotById = async (req, res, next) => {
    try {
        const { companyId, swotId } = req.params;

        const [found] = await findSwots({
            where: {
                fk_company_id: companyId,
                swot_id: swotId
            }, swotId,
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('SWOT');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// consolidate the 4 status down into one function
module.exports.findSwotsByStatus = async (req, res, next) => {
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

            // get shallow documents
            search.includeItems = false;

            results = await findSwots(search);
        }
        else {
            [results] = await findSwots(search);
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

module.exports.rejectSwot = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, swotId } = req.params;

        // check for permission for reject
        const { approve } = await findRights(rejected_by, companyId, 'm04_01');
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findSwots({
            where: {
                fk_company_id: companyId,
                swot_id: swotId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('SWOT');

        const { remarks } = req.body;
        await toBeRejected.update({
            remarks,
            status: DOCUMENT_STATUS.REJECTED
        });

        // TODO email notification

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.approveSwot = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, swotId } = req.params;

        // check for permission for approve
        const { approve } = await findRights(approved_by, companyId, 'm04_01');
        if (!approve) throw new E.PermissionError('approve');

        // find the to be approved swot
        const [toBeApproved] = await findSwots({
            where: {
                fk_company_id: companyId,
                swot_id: swotId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('SWOT');

        // find the active swot
        const [currentActive] = await findSwots({
            where: {
                fk_company_id: companyId,
                status: DOCUMENT_STATUS.ACTIVE
            },
            limit: 1,
            includeItems: false
        });

        // there may be a case where the company has no active swot
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
            // reverse change on active swot
            await currentActive?.update({
                status: DOCUMENT_STATUS.ACTIVE,
                expired_at: null
            });
            throw error;
        }

        await matchActiveSwot(companyId, toBeApproved.swot_id);

        // TODO email notification

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// DELETE

module.exports.deleteSwot = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, swotId } = req.params;

        const [toBeDeleted] = await findSwots({
            where: (Op) => ({
                fk_company_id: companyId,
                swot_id: swotId,
                status: { [Op.or]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED] }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('SWOT');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            // if the person deleting this rejected document is not its author
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError('Cannot delete another employee\'s rejected document');
            await deleteSwot(companyId, swotId, true);
        }
        else {
            const { approve } = await findRights(deleted_by, companyId, 'm04_01');
            if (!approve) throw new E.PermissionError('delete');
            await deleteSwot(companyId, swotId, false);
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
