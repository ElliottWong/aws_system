const {
    insertReference,
    findReference
} = require('../models/com.references');

const { findRights } = require('../models/com.roles');
// const { sendEmail, templates } = require('../utils/email');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertReference = async (req, res, next) => {
    try {
        const { fk_employee_id: edited_by } = res.locals.account;
        const { companyId } = req.params;

        // if the employee has rights to this module
        const { edit } = await findRights(edited_by, companyId, 'm02_01');
        if (!edit) throw new E.PermissionError('edit');

        const { content } = req.body;

        const { reference_id } = await insertReference({
            companyId, edited_by, content
        });

        res.status(201).send(r.success201({ reference_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findReference = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const found = await findReference(companyId);

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};
