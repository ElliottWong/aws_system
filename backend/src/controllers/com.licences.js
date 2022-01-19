const {
    insertLicence,
    insertRenewalUpload,
    findLicence,
    editLicence,
    archiveLicence,
    activateLicence,
    deleteLicence
} = require('../models/com.licences');

const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(createdBy, companyId, MODULE.PLC);
        if (!edit) throw new E.PermissionError('create licence');

        const { licence_id } = await insertLicence(companyId, createdBy, req.body);

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
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId, licenceId } = req.params;

        await insertRenewalUpload(
            licenceId, companyId, createdBy,
            req.body, req.upload
        );

        res.status(201).send(r.success201());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findLicences = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.PLC);
        if (!edit) throw new E.PermissionError('view');

        const archivedOnly = parseBoolean(req.query.archived);
        const licences = await findLicence.all(companyId, true, archivedOnly);

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
        const { fk_employee_id: employeeId } = res.locals.account;

        const archivedOnly = parseBoolean(req.query.archived);
        const licences = await findLicence.allResponsible(employeeId, true, archivedOnly);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.PLC);
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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, licenceId } = req.params;

        const licence = await findLicence.one(licenceId, companyId, employeeId, true);

        res.status(200).send(r.success200(licence));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can edit
        await editLicence(licenceId, companyId, employeeId, req.body);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can archive
        await archiveLicence(licenceId, companyId, employeeId);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, licenceId } = req.params;

        await activateLicence(licenceId, companyId, employeeId);

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
        const { fk_employee_id: deletedBy } = res.locals.account;
        const { companyId, licenceId } = req.params;

        // only its creator can delete
        await deleteLicence(licenceId, companyId, deletedBy);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// module.exports.deleteRenewal = async (req, res, next) => {
//     try {
//         const { fk_employee_id: deletedBy } = res.locals.account;
//         const { companyId, licenceId, renewalId } = req.params;

//         await deleteRenewal(renewalId, licenceId, companyId, deletedBy);

//         res.status(200).send(r.success200());
//         return next();
//     }
//     catch (error) {
//         return next(error);
//     }
// };
