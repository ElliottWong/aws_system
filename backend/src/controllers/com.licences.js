const {
    insertLicence,
    insertRenewalUpload,
    findLicence,
    editLicence,
    archiveLicence,
    activateLicence,
    deleteLicence
} = require('../models/com.licences');

const { findRights } = require('../models/com.roles');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(created_by, companyId, 'm07_02');
        if (!edit) throw new E.PermissionError('create licence');

        const { licence_id } = await insertLicence(companyId, created_by, req.body);

        res.status(201).send(r.success201({ licence_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertRenewalUpload = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId, licenceId } = req.params;

        const { renewed_at } = req.body;

        const { licence_upload_id } = await insertRenewalUpload(
            companyId, licenceId,
            created_by, renewed_at,
            req.upload
        );

        res.status(201).send(r.success201({ licence_upload_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findLicences = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employee_id, companyId, 'm07_02');
        if (!edit) throw new E.PermissionError('view');

        const licences = await findLicence.all(companyId, true);

        res.status(200).send(r.success200(licences));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findResponsibleLicences = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;

        const licences = await findLicence.allResponsible(employee_id, true);

        res.status(200).send(r.success200(licences));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findArchivedLicences = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employee_id, companyId, 'm07_02');
        if (!edit) throw new E.PermissionError('view');

        const licences = await findLicence.all(companyId, true, true);

        res.status(200).send(r.success200(licences));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findLicenceById = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, licenceId } = req.params;

        const licences = await findLicence.one(companyId, licenceId, employee_id, true);

        res.status(200).send(r.success200(licences));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can edit
        await editLicence(companyId, licenceId, employee_id, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.archiveLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can archive
        await archiveLicence(companyId, licenceId, employee_id);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.activateLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, licenceId } = req.params;

        await activateLicence(companyId, licenceId, employee_id);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.deleteLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can delete
        await deleteLicence(companyId, licenceId, deleted_by);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
