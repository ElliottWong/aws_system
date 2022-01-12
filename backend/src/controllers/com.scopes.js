const {
    insertScope,
    findScope
} = require('../models/com.scopes');

const { findRights } = require('../models/com.roles');
// const { sendEmail, templates } = require('../utils/email');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertScope = async (req, res, next) => {
    try {
        const { fk_employee_id: edited_by } = res.locals.account;
        const { companyId } = req.params;

        // if the employee has rights to this module
        const { edit } = await findRights(edited_by, companyId, 'm01_01');
        if (!edit) throw new E.PermissionError('edit');

        const { content } = req.body;

        const { scope_id } = await insertScope({
            companyId, edited_by, content
        });

        res.status(201).send(r.success201({ scope_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findScope = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const found = await findScope(companyId);

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};
