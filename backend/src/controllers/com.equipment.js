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
} = require('../models/com.equipment');

const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { sendEmail, templates } = require('../services/email');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const now = new Date();

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

        const { edit, employee: creatorEmployee } = await findRights(createdBy, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('create equipment');

        const { equipment_id } = await insertOneEquipment(companyId, createdBy, req.body);

        // To creator email
        const emailContent = templates.createAndUpdatedEquipment(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'created',
            'Created',
            `<p>Name: ${req.body.name}</p>
            <p>Reference Number: ${req.body.reference_number}</p>
            <p>Register Number: ${req.body.register_number}</p>
            <p>Serial Number: ${req.body.serial_number}</p>
            <p>Model: ${req.body.model}</p>
            <p>Location: ${req.body.location}</p>
            <p>Created Date: ${now}</p>
            `,
            `equipment-maintenance/manage-equipment/${equipment_id}`,
            'Equipment'
        );

        sendEmail(
            creatorEmployee.email,
            `You have created Equipment "${req.body.name}"`,
            emailContent
        ).catch((error) =>
            console.log(`Non-fatal: Failed to send email\n${error}`)
        );

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
        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('view');

        const categories = await findCategories.all(companyId);

        res.status(200).send(r.success200(categories));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllEquipmentInCategory = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        // cannot see all equipments if cannot edit (add equipments)
        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('view');

        const archivedOnly = parseBoolean(req.query.archived);
        const found = await findEquipment.allInCategory(categoryId, companyId, archivedOnly);

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllResponsibleEquipmentInCategory = async (req, res, next) => {
    try {
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        const archivedOnly = parseBoolean(req.query.archived);
        const found = await findEquipment.allResponsibleInCategory(categoryId, companyId, employeeId, archivedOnly);

        res.status(200).send(r.success200(found));
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

        const found = await findEquipment.all(companyId, archivedOnly);

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

        const found = await findEquipment.allResponsible(employeeId, archivedOnly);

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

        const found = await findEquipment.one(equipmentId, companyId, employeeId);

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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('edit');

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

        //* To check
        const { edit, employee: creatorEmployee } = await findRights(employeeId, companyId, MODULE.PLC);
        if (!edit) throw new E.PermissionError('edit equipment');

        // To creator email
        const emailContent = templates.createAndUpdatedEquipment(
            `${creatorEmployee.firstname} ${creatorEmployee.lastname}`,
            'updated',
            'Updated',
            `<p>Name: ${req.body.name}</p>
            <p>Reference Number: ${req.body.reference_number}</p>
            <p>Register Number: ${req.body.register_number}</p>
            <p>Serial Number: ${req.body.serial_number}</p>
            <p>Model: ${req.body.model}</p>
            <p>Location: ${req.body.location}</p>
            <p>Created Date: ${now}</p>
            `,
            `equipment-maintenance/manage-equipment/${equipmentId}`,
            'Equipment'
        );

        sendEmail(
            creatorEmployee.email,
            `You have updated Equipment "${req.body.name}"`,
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
        const { fk_employee_id: employeeId } = res.locals.account;
        const { companyId, categoryId } = req.params;

        const { edit } = await findRights(employeeId, companyId, MODULE.EMP);
        if (!edit) throw new E.PermissionError('delete');

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
