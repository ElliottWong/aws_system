const Yup = require('yup');

const {
    insertAnalysis,
    findBlockingAnalysis,
    lockAnalysis: isAnalysisLocked,
    findAnalyses,
    deleteAnalysis
} = require('../models/com.risksAnalyses');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const now = new Date();   

// CREATE

module.exports.insertAnalysis = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const [locked] = await isAnalysisLocked();
        if (locked) throw new E.BlockingError('SWOT');

        // check if a pending swot or rejected swot already exists
        const existingBlock = await findBlockingAnalysis(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError('RO', DOCUMENT_STATUS.PENDING);

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError('RO', DOCUMENT_STATUS.REJECTED);

            // the new form is from the same employee that has a rejected form
            await existingBlock.destroy({ force: true });
        }

        // approver
        const approved_by = parseInt(req.body.approved_by);
        if (isNaN(approved_by))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        // check author for edit rights
        const { edit, employee: authorEmployee } = await findRights(created_by, companyId, 'm06_01');
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(approved_by, companyId, 'm06_01');
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        const { risks_analysis_id, status } = await insertAnalysis({
            companyId, ...req.body, created_by, approved_by
        });

        const emailContent = templates.documentSendApproval(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Risk and Opportunity',
            `${now}`,
            'risk-n-opportunity',
            'Risk and Opportunity'
        );

        sendEmail(approvingEmployee.email, 'Risk and Opportunity document requires your approval', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(201).send(r.success201({ risks_analysis_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllAnalyses = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findAnalyses({
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

module.exports.findAnalysisById = async (req, res, next) => {
    try {
        const { companyId, analysisId } = req.params;

        const [found] = await findAnalyses({
            where: {
                fk_company_id: companyId,
                risks_analysis_id: analysisId
            },
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('RO');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// consolidate the 4 status down into one function
module.exports.findAnalysesByStatus = async (req, res, next) => {
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

            results = await findAnalyses(search);
        }
        else {
            [results] = await findAnalyses(search);
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

module.exports.rejectAnalysis = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, analysisId } = req.params;

        // check for permission for reject
        const { approve, employee: rejectingEmployee } = await findRights(rejected_by, companyId, 'm06_01');
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findAnalyses({
            where: {
                fk_company_id: companyId,
                risks_analysis_id: analysisId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('RO');

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
            'm06_01'
        );

        // Send email to the author
        const emailContent = templates.documentRejected(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${rejectingEmployee.firstname} ${rejectingEmployee.lastname}`,
            'Risk and Opportunity',
            `${now}`,
            `${remarks}`,
            'risk-n-opportunity',
            'Risk and Opportunity'
        );

        sendEmail(
            authorEmployee.email,
            'Risk and Opportunity document have been rejected',
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

module.exports.approveAnalysis = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, analysisId } = req.params;

        // check for permission for approve
        const { approve, employee: approverEmployee } = await findRights(approved_by, companyId, 'm06_01');
        if (!approve) throw new E.PermissionError('approve');

        // find the to be approved swot
        const [toBeApproved] = await findAnalyses({
            where: {
                fk_company_id: companyId,
                risks_analysis_id: analysisId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('RO');

        // find the active swot
        const [currentActive] = await findAnalyses({
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

        // authors
        const created_by = parseInt(toBeApproved.created_by);
        if (isNaN(created_by))
            throw new E.ParamTypeError('created_by', req.body.created_by, 1);

        // check authors for approve rights
        const { employee: authorEmployee } = await findRights(
            created_by,
            companyId,
            'm06_01'
        );

        // Send email to the author
        const emailContent = templates.documentApproval(
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            `${approverEmployee.firstname} ${approverEmployee.lastname}`,
            'Risk and Opportunity',
            `${now}`,
            'risk-n-opportunity',
            'Risk and Opportunity'
        );

        sendEmail(
            authorEmployee.email,
            'Risk and Opportunity document have been approved',
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

// TODO test whether if deleting an analysis will cause deletion of 
// associated swot items
module.exports.deleteAnalysis = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, analysisId } = req.params;

        const [toBeDeleted] = await findAnalyses({
            where: (Op) => ({
                fk_company_id: companyId,
                analysisId: analysisId,
                status: { [Op.in]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED] }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('RO');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            // if the person deleting this rejected document is not its author
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError('Cannot delete another employee\'s rejected document');
            await deleteAnalysis(companyId, analysisId, true);
        }
        else {
            const { approve } = await findRights(deleted_by, companyId, 'm06_01');
            if (!approve) throw new E.PermissionError('delete');
            await deleteAnalysis(companyId, analysisId, false);
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
