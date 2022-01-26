const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const {
    insertOneMaintenance,
    insertMaintenanceUpload,
    findOneMaintenance,
    editOneMaintenance,
    deleteOneMaintenance,
    deleteMaintenanceUpload
} = require('../models/com.equipmentMaintenance');

const now = new Date();

const { format, addDays } = require('date-fns');

const { sendEmail, templates } = require('../services/email');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertOneMaintenance = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        const { maintenance_id } = await insertOneMaintenance(equipmentId, companyId, createdBy, req.body);

        const { edit, employee: creatorEmployee } = await findRights(createdBy, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('create maintenrance');


        // To assignees email
        for (let i = 0; i < req.body.assignees.length; i++) {

            const allAssignees = req.body.assignees[i];

            const { employee: allAssigneesEmployees } = await findRights(allAssignees, companyId, MODULE.EMP);

            const emailContent = templates.addedAndUpdatedAssigneesInMaintenance(
                `${allAssigneesEmployees.firstname} ${allAssigneesEmployees.lastname}`,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
                'assign',
                'Created',
                `<p>Type: ${req.body.type}</p>
                <p>Last Service Date: ${req.body.last_service_at}</p>
                <p>Maintenance Frequency: ${req.body.freq_multiplier} ${req.body.freq_unit_time}</p>
                <p>Created Date: ${now}</p>
            `,
                `equipment-maintenance/manage-equipment/${equipmentId}/manage-cycle/${maintenance_id}`,
                'Maintenance'
            );

            sendEmail(
                allAssigneesEmployees.email,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname} have assign you in Maintenance`,
                emailContent
            ).catch((error) =>
                console.log(`Non-fatal: Failed to send email\n${error}`)
            );

        }

        // To creator email
        const emailContent = templates.createAndUpdatedMaintenance(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'created',
            'Created',
            `<p>Type: ${req.body.type}</p>
            <p>Last Service Date: ${req.body.last_service_at}</p>
            <p>Maintenance Frequency: ${req.body.freq_multiplier} ${req.body.freq_unit_time}</p>
            <p>Created Date: ${now}</p>
        `,
            `equipment-maintenance/manage-equipment/${equipmentId}/manage-cycle/${maintenance_id}`,
            'Maintenance'
        );

        sendEmail(
            creatorEmployee.email,
            `You have created Maintenance "${req.body.type}"`,
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

        res.status(201).send(r.success201({ maintenance_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertMaintenanceUpload = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId, equipmentId, maintenanceId } = req.params;

        const { maintenance_upload_id } = await insertMaintenanceUpload(
            maintenanceId,
            createdBy,
            req.body,
            req.upload
        );

        res.status(201).send(r.success201({ maintenance_upload_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findOneMaintenance = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId, maintenanceId } = req.params;

        const maintenance = await findOneMaintenance(maintenanceId, equipmentId, companyId, employeeId);
        if (!maintenance) throw new E.NotFoundError('maintenance');

        res.status(200).send(r.success200(maintenance));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editOneMaintenance = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId, maintenanceId } = req.params;

        await editOneMaintenance(maintenanceId, equipmentId, companyId, employeeId, req.body);

        const { edit, employee: creatorEmployee } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('edit maintenance');


        // To assignees email
        for (let i = 0; i < req.body.assignees.length; i++) {

            const allAssignees = req.body.assignees[i];

            const { employee: allAssigneesEmployees } = await findRights(allAssignees, companyId, MODULE.EMP);

            const emailContent = templates.addedAndUpdatedAssigneesInMaintenance(
                `${allAssigneesEmployees.firstname} ${allAssigneesEmployees.lastname}`,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
                'updated and assign',
                'Updated',
                `<p>Type: ${req.body.type}</p>
                <p>Last Service Date: ${req.body.last_service_at}</p>
                <p>Maintenance Frequency: ${req.body.freq_multiplier} ${req.body.freq_unit_time}</p>
                <p>Created Date: ${now}</p>
            `,
                `equipment-maintenance/manage-equipment/${equipmentId}/manage-cycle/${maintenanceId}`,
                'Maintenance'
            );

            sendEmail(
                allAssigneesEmployees.email,
                `${creatorEmployee.firstname} ${creatorEmployee.lastname} have updated and assign you in Maintenance`,
                emailContent
            ).catch((error) =>
                console.log(`Non-fatal: Failed to send email\n${error}`)
            );

        }

        // To creator email
        const emailContent = templates.createAndUpdatedMaintenance(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'updated',
            'Updated',
            `<p>Type: ${req.body.type}</p>
            <p>Last Service Date: ${req.body.last_service_at}</p>
            <p>Maintenance Frequency: ${req.body.freq_multiplier} ${req.body.freq_unit_time}</p>
            <p>Created Date: ${now}</p>
        `,
            `equipment-maintenance/manage-equipment/${equipmentId}/manage-cycle/${maintenanceId}`,
            'Maintenance'
        );

        sendEmail(
            creatorEmployee.email,
            `You have updated Maintenance "${req.body.type}"`,
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

// module.exports.editMaintenanceUpload = async (req, res, next) => {
//     try {

//         return next();
//     }
//     catch (error) {
//         return next(error);
//     }
// };

// ============================================================

module.exports.deleteOneMaintenance = async (req, res, next) => {
    try {
        const { fk_employee_id: deletedBy } = res.locals.account;
        const { companyId, equipmentId, maintenanceId } = req.params;

        await deleteOneMaintenance(maintenanceId, equipmentId, companyId, deletedBy);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.deleteMaintenanceUpload = async (req, res, next) => {
    try {
        const { fk_employee_id: deletedBy } = res.locals.account;
        const { companyId, equipmentId, maintenanceId, uploadId } = req.params;

        await deleteMaintenanceUpload(uploadId, maintenanceId, deletedBy);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
