const {
    insertOneEquipment,
    insertMaintenanceUpload,
    findEquipment,
    editOneEquipment,
    archiveOneEquipment,
    activateOneEquipment,
    deleteOneEquipment
} = require('../models/com.equipment.v2');

const { findRights } = require('../models/com.roles');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// interface EquipmentMaintenance {
//     equipment_type: string,
//     reference_number: string,
//     register_number: string,
//     serial_number: string,
//     model: string,
//     maintenance_type: string,
//     maintenance_frequency_number: number,
//     maintenance_frequency_type: string,
//     location: string
// }

module.exports.insertOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(created_by, companyId, 'm07_01');
        if (!edit) throw new E.PermissionError('create equipment');

        const { equipment_id } = await insertOneEquipment(companyId, created_by, req.body);

        // TODO email

        res.status(201).send(r.success201({ equipment_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertMaintenanceUplaod = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        const { serviced_at } = req.body;

        // checks are within the function
        const { equipment_upload_id } = await insertMaintenanceUpload(
            companyId, equipmentId,
            created_by, serviced_at,
            req.upload
        );

        res.status(201).send(r.success201({ equipment_upload_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employee_id, companyId, 'm07_01');
        if (!edit) throw new E.PermissionError('view');

        const manyEquipment = await findEquipment.all(companyId, true);

        res.status(200).send(r.success200(manyEquipment));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllResponsibleEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;

        const manyEquipment = await findEquipment.allResponsible(employee_id, true);

        res.status(200).send(r.success200(manyEquipment));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllArchivedEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employee_id, companyId, 'm07_01');
        if (!edit) throw new E.PermissionError('view');

        const manyEquipment = await findEquipment.all(companyId, true, true);

        res.status(200).send(r.success200(manyEquipment));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findOneEquipmentById = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        // only the owner and those responsible can see
        const found = await findEquipment.one(companyId, equipmentId, employee_id, true);

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        // anyone who can create can edit
        const { edit } = await findRights(employee_id, companyId, 'm07_01');
        if (!edit) throw new E.PermissionError('edit equipment');

        await editOneEquipment(companyId, equipmentId, employee_id, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.archiveOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        // only the equipment's creator can archive
        await archiveOneEquipment(companyId, equipmentId, employee_id);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.activateOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employee_id } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        await activateOneEquipment(companyId, equipmentId, employee_id);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.deleteOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        // only the equipment's creator can delete
        await deleteOneEquipment(companyId, equipmentId, deleted_by);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
