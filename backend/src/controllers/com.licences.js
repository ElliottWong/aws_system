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

const { sendEmail, templates } = require('../services/email');

const { parseBoolean } = require('../utils/request');
const now = new Date();
const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertLicence = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        const { edit, employee: creatorEmployee } = await findRights(createdBy, companyId, MODULE.PLC);
        if (!edit) throw new E.PermissionError('create licence');

        const { licence_id } = await insertLicence(companyId, createdBy, req.body);


        // To assignees email
        for (let i = 0; i < req.body.assignees.length; i++) {

            const allAssignees = req.body.assignees[i];

            const { employee: allAssigneesEmployees } = await findRights(allAssignees, companyId, MODULE.PLC);

            const emailContent = templates.addedAndUpdatedAssigneesInLicence(
                `${allAssigneesEmployees.firstname} ${allAssigneesEmployees.lastname}`,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
                'assign',
                'Created',
                `<p>Licence name: ${req.body.licence_name}</p>
                <p>Licence number: ${req.body.licence_number}</p>
                <p>External Organisation: ${req.body.external_organisation}</p>
                <p>Issued at: ${req.body.issued_at}</p>
                <p>Expires at: ${req.body.expires_at}</p>
                <p>Created Date: ${now}</p>
            `,
                `licenses/manage-license/${licence_id}`,
                'Licence'
            );

            sendEmail(
                allAssigneesEmployees.email,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname} have assign you in Licence`,
                emailContent
            ).catch((error) =>
                console.log(`Non-fatal: Failed to send email\n${error}`)
            );

        }

        // To creator email
        const emailContent = templates.createAndUpdatedLicence(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'created',
            'Created',
            `<p>Licence name: ${req.body.licence_name}</p>
            <p>Licence number: ${req.body.licence_number}</p>
            <p>External Organisation: ${req.body.external_organisation}</p>
            <p>Issued at: ${req.body.issued_at}</p>
            <p>Expires at: ${req.body.expires_at}</p>
            <p>Created Date: ${now}</p>
        `,
            `licenses/manage-license/${licence_id}`,
            'Licence'
        );

        sendEmail(
            creatorEmployee.email,
            `You have created Licence "${req.body.licence_name}"`,
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

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

        //* To check
        const { edit, employee: creatorEmployee } = await findRights(employeeId, companyId, MODULE.PLC);
        if (!edit) throw new E.PermissionError('edit licence');

        // To assignees email
        for (let i = 0; i < req.body.assignees.length; i++) {

            const allAssignees = req.body.assignees[i];

            const { employee: allAssigneesEmployees } = await findRights(allAssignees, companyId, MODULE.PLC);

            const emailContent = templates.addedAndUpdatedAssigneesInLicence(
                `${allAssigneesEmployees.firstname} ${allAssigneesEmployees.lastname}`,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
                'updated and assign',
                'Updated',
                `<p>Licence name: ${req.body.licence_name}</p>
                <p>Licence number: ${req.body.licence_number}</p>
                <p>External Organisation: ${req.body.external_organisation}</p>
                <p>Issued at: ${req.body.issued_at}</p>
                <p>Expires at: ${req.body.expires_at}</p>
                <p>Created Date: ${now}</p>
                `,
                `licenses/manage-license/${licenceId}`,
                'Licence'
            );

            sendEmail(
                allAssigneesEmployees.email,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname} have updated and assign you in Licence`,
                emailContent
            ).catch((error) =>
                console.log(`Non-fatal: Failed to send email\n${error}`)
            );

        }

        // To creator email
        const emailContent = templates.createAndUpdatedLicence(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'updated',
            'Updated',
            `<p>Licence name: ${req.body.licence_name}</p>
            <p>Licence number: ${req.body.licence_number}</p>
            <p>External Organisation: ${req.body.external_organisation}</p>
            <p>Issued at: ${req.body.issued_at}</p>
            <p>Expires at: ${req.body.expires_at}</p>
            <p>Created Date: ${now}</p>
            `,
            `licenses/manage-license/${licenceId}`,
            'Licence'
        );

        sendEmail(
            creatorEmployee.email,
            `You have updated Licence "${req.body.licence_name}"`,
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
