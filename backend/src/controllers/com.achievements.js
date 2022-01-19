const Yup = require('yup');

const {
    insertAchievement,
    findBlockingAchievement,
    findAchievements,
    deleteAchievement
} = require('../models/com.achievements');

const { findRights } = require('../models/com.roles');
const { sendEmail, templates } = require('../services/email');

const { testEnum, DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertAchievemnt = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const existingBlock = await findBlockingAchievement(companyId);

        if (existingBlock) {
            // there is a pending form, so cannot submit another
            if (existingBlock.status === DOCUMENT_STATUS.PENDING)
                throw new E.BlockingError('OAP', DOCUMENT_STATUS.PENDING);

            // rejected form below

            // there is a rejected form, and new form is not from the same employee
            if (existingBlock.created_by !== created_by)
                throw new E.BlockingError('OAP', DOCUMENT_STATUS.REJECTED);

            // the new form is from the same employee that has a rejected form
            await existingBlock.destroy({ force: true });
        }

        // approver
        const approved_by = parseInt(req.body.approved_by);
        if (isNaN(approved_by))
            throw new E.ParamTypeError('approved_by', req.body.approved_by, 1);

        // check author for edit rights
        const { edit, employee: authorEmployee } = await findRights(created_by, companyId, 'm06_02');
        if (!edit) throw new E.PermissionError('edit');

        // check approver for appove rights
        const { approve, employee: approvingEmployee } = await findRights(approved_by, companyId, 'm06_02');
        if (!approve) throw new E.PermissionError('approve');

        // check if the employees are from the same company
        if (authorEmployee.fk_company_id !== approvingEmployee.fk_company_id)
            throw new E.ForeignOrganisationError();

        // data from the request body
        const { title } = req.body;
        const achievements = JSON.parse(req.body.achievements);

        const [{ achievement_id, status }, deletedFileIds] = await insertAchievement({
            companyId: companyId, created_by, approved_by, title, achievements
        }, req.uploads);

        const emailContent = templates.documentApproval(
            `${approvingEmployee.firstname} ${approvingEmployee.lastname}`,
            `${authorEmployee.firstname} ${authorEmployee.lastname}`,
            'Objective Achievement Program',
            'objective-achievement-program',
            'Objective Achievement Program'
        );

        sendEmail(approvingEmployee.email, 'A document requires your approval', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(201).send(r.success201({ achievement_id, status }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllAchievements = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findAchievements({
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

module.exports.findAchievementById = async (req, res, next) => {
    try {
        const { companyId, achievementId } = req.params;

        const [found] = await findAchievements({
            where: {
                fk_company_id: companyId,
                achievement_id: achievementId
            },
            limit: 1,
            includeItems: true
        });
        if (!found) throw new E.NotFoundError('OAP');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// consolidate the 4 status down into one function
module.exports.findAchievementsByStatus = async (req, res, next) => {
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

            results = await findAchievements(search);
        }
        else {
            [results] = await findAchievements(search);
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

module.exports.rejectAchievement = async (req, res, next) => {
    try {
        const { fk_employee_id: rejected_by } = res.locals.account;
        const { companyId, achievementId } = req.params;

        // check for permission for reject
        const { approve } = await findRights(rejected_by, companyId, 'm06_02');
        if (!approve) throw new E.PermissionError('reject');

        const [toBeRejected] = await findAchievements({
            where: {
                fk_company_id: companyId,
                achievement_id: achievementId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeRejected) throw new E.NotFoundError('OAP');

        const { remarks } = req.body;
        await toBeRejected.update({
            remarks,
            status: DOCUMENT_STATUS.REJECTED
        });

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.approveAchievement = async (req, res, next) => {
    try {
        const { fk_employee_id: approved_by } = res.locals.account;
        const { companyId, achievementId } = req.params;

        // check for permission for reject
        const { approve } = await findRights(approved_by, companyId, 'm06_02');
        if (!approve) throw new E.PermissionError('reject');

        const [toBeApproved] = await findAchievements({
            where: {
                fk_company_id: companyId,
                achievement_id: achievementId,
                status: DOCUMENT_STATUS.PENDING
            },
            limit: 1,
            includeItems: false
        });
        if (!toBeApproved) throw new E.NotFoundError('OAP');

        const [currentActive] = await findAchievements({
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
            // reverse change on active swot
            await currentActive?.update({
                status: DOCUMENT_STATUS.ACTIVE,
                expired_at: null
            });
            throw error;
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// DELETE

module.exports.deleteAchievement = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, achievementId } = req.params;

        const [toBeDeleted] = await findAchievements({
            where: (Op) => ({
                fk_company_id: companyId,
                achievement_id: achievementId,
                status: { [Op.or]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.REJECTED] }
            }),
            limit: 1,
            includeItems: false
        });
        if (!toBeDeleted) throw new E.NotFoundError('OAP');

        if (toBeDeleted.status === DOCUMENT_STATUS.REJECTED) {
            // if the person deleting this rejected document is not its author
            if (toBeDeleted.created_by !== deleted_by)
                throw new E.EmployeeError('Cannot delete another employee\'s rejected document');
            await deleteAchievement(companyId, achievementId, true);
        }
        else {
            // check for permission for delete
            const { approve } = await findRights(deleted_by, companyId, 'm06_02');
            if (!approve) throw new E.PermissionError('delete');
            await deleteAchievement(companyId, achievementId, false);
        }

        // TODO i realise that for rejected OAP, they may have uploaded new files
        // and because it is rejected and gets deleted, 
        // it should also be deleted from cloudinary

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
