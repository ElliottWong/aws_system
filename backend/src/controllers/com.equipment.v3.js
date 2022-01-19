const {
    // CREATE
    insertCategory,
    insertOneEquipment,

    // READ
    findCategories,
    findEquipment,

    // UPDATE
    editCategory,
    editOneEquipment,
    archiveOneEquipment,
    activateOneEquipment,

    // DELETE
    deleteCategory,
    deleteOneEquipment
} = require('../models/com.equipment.v3');

const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertCategory = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(createdBy, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('create equipment');

        const { category_id } = await insertCategory(companyId, req.body);

        res.status(201).send(r.success201({ category_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: createdBy } = res.locals.account;
        const { companyId } = req.params;

        const { edit } = await findRights(createdBy, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('create equipment');

        const { equipment_id } = await insertOneEquipment(companyId, createdBy, req.body);

        res.status(201).send(r.success201({ equipment_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// categories only
// no more, no less
module.exports.findCategories = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employeeId, companyId, 'm07_01');
        if (!edit) throw new E.PermissionError('view');

        const categories = await findCategories.all({ companyId });

        res.status(200).send(r.success200(categories));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findCategoryWithAllEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('view');

        const categories = await findCategories.one({
            companyId,
            categoryId,
            includeEquipment: true,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true
        });

        res.status(200).send(r.success200(categories));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// FIXME problematic
module.exports.findCategoryWithAssignedEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        const categories = await findCategories.one({
            companyId,
            categoryId,
            employeeId,
            includeEquipment: true,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true
        });

        res.status(200).send(r.success200(categories));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('view');

        const archivedOnly = parseBoolean(req.query.archived);

        const found = await findEquipment.all({
            companyId,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true,
            archivedOnly
        });

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllResponsibleEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;

        const archivedOnly = parseBoolean(req.query.archived);

        const found = await findEquipment.allResponsible({
            employeeId,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true,
            archivedOnly
        });

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('view');

        const found = await findEquipment.one({
            equipmentId,
            companyId,
            employeeId,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true
        });

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editCategory = async (req, res, next) => {
    try {
        const { companyId, categoryId } = req.params;
        await editCategory(categoryId, companyId, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.editOneEquipment = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        await editOneEquipment(equipmentId, companyId, employeeId, req.body);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        await archiveOneEquipment(equipmentId, companyId, employeeId);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        await activateOneEquipment(equipmentId, companyId, employeeId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.deleteCategory = async (req, res, next) => {
    try {
        const { companyId, categoryId } = req.params;
        await deleteCategory(categoryId, companyId);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, equipmentId } = req.params;

        await deleteOneEquipment(equipmentId, companyId, employeeId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
