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

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;



module.exports.insertOneMaintenance = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        const { maintenance_id } = await insertOneMaintenance(equipmentId, companyId, createdBy, req.body);

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

        const maintenance = await findOneMaintenance({
            maintenanceId,
            equipmentId,
            companyId,
            employeeId,
            includeAssignees: true,
            includeUploads: true
        });
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
