const Yup = require('yup');

const {
    insertParty,
    findBlockingParty,
    findParties,
    deleteParty
} = require('../models/com.interestedParties');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const now = new Date();   

// CREATE

module.exports.insertInterestedParties = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const existingBlock = await findBlockingParty(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError(
                    'interested parties document',
                    DOCUMENT_STATUS.PENDING
                );

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError(
                    'interested parties document',
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
            'm04_02'
        );
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(
            approved_by,
            companyId,
            'm04_02'
        );
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        const { party_id, status } = await insertParty({
            ...req.body,
            created_by,
            companyId
        });

        // Send email to the approver
        const emailContent = templates.documentSendApproval(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Interested Parties',
            `${now}`,
            'interested-party',
            'Interested Parties'
        );

        sendEmail(
            approvingEmployee.email,
            'Interested Parties document requires your approval',
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

        res.status(201).send(r.success201({ party_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

// shallow search, does not include items
module.exports.findAllInterestedParties = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findParties({
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

module.exports.findInterestedPartiesById = async (req, res, next) => {
    try {
        const { companyId, partyId } = req.params;

        const [found] = await findParties({
            where: {
                fk_company_id: companyId,
                party_id: partyId
            },
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('Interested Parties');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findInterestedPartiesByStatus = async (req, res, next) => {
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

            results = await findParties(search);
        }
        else {
            [results] = await findParties(search);
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

module.exports.rejectInterestedParties = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, partyId } = req.params;

        // check for permission for reject
        const { approve, employee: rejectingEmployee } = await findRights(
            rejected_by,
            companyId,
            'm04_02'
        );
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findParties({
            where: {
                fk_company_id: companyId,
                party_id: partyId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('Interested Parties');

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
            'm04_02'
        );

        // Send email to the author
        const emailContent = templates.documentRejected(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            'Interested Parties',
            `${now}`,
            `${remarks}`,
            'interested-party',
            'Interested Parties'
        );

        sendEmail(
            authorEmployee.email,
            'Interested Parties document have been rejected',
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

module.exports.approveInterestedParties = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, partyId } = req.params;

        // check for permission for approve
        const { approve, employee: approverEmployee } = await findRights(approved_by, companyId, 'm04_02');
        if (!approve) throw new E.PermissionError('approve');

        // find the to be approved party
        const [toBeApproved] = await findParties({
            where: {
                fk_company_id: companyId,
                party_id: partyId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('Interested Parties');

        // find the active Party
        const [currentActive] = await findParties({
            where: {
                fk_company_id: companyId,
                party_id: partyId,
                status: DOCUMENT_STATUS.ACTIVE
            },
            limit: 1,
            includeItems: false
        });

        // there may be a case where the company has no active party
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
            // reverse change on active party
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
            'm04_02'
        );

        // Send email to the author
        const emailContent = templates.documentApproval(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${approverEmployee.firstname} ${approverEmployee.lastname}`,
            'Interested Parties',
            `${now}`,
            'interested-party',
            'Interested Parties'
        );

        sendEmail(
            authorEmployee.email,
            'Interested Parties document have been approved',
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

module.exports.deleteInterestedParties = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, partyId } = req.params;

        const [toBeDeleted] = await findParties({
            where: (Op) => ({
                fk_company_id: companyId,
                party_id: partyId,
                status: {
                    [Op.in]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED]
                }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('Interested Parties');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            // if the person deleting this rejected document is not its author
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError(
                    'Cannot delete another employee\'s rejected document'
                );
            await deleteParty(companyId, partyId, true);
        }
        else {
            // check for permission for delete
            const { approve } = await findRights(deleted_by, companyId, 'm04_02');
            if (!approve) throw new E.PermissionError('delete');
            await deleteParty(companyId, partyId, false);
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
