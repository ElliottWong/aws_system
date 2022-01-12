const {
    insertRole,
    assignEmployeeRoles,
    findRoles,
    findRights,
    findEmployeesByModuleRight,
    editRole,
    deleteRole
} = require('../models/com.roles');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const { ADMIN_LEVEL } = require('../config/enums');

// CREATE

module.exports.insertRole = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // must check for permission to add role if not a system admin
        if (decoded.admin_level !== ADMIN_LEVEL.SUPER) {
            // const { edit } = findRights(decoded.employee_id, companyId, "m05_03");
            throw new E.PermissionError('create role');
        }

        const { role_id } = await insertRole(companyId, req.body);
        res.status(201).send(r.success201({ role_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// Inserts the roles for a given employee
module.exports.assignEmployeeRoles = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // must check for permission to assign roles if not a system admin
        // 23/08/2021 leave it to only system admin to assign roles
        if (decoded.admin_level !== ADMIN_LEVEL.SUPER) {
            // const { edit } = findRights(decoded.employee_id, companyId, "m05_03");
            // if (!edit) return res.status(403).send(r.error403({
            //     message: "Employee cannot add roles"
            // }));
            throw new E.AdminError('add roles');
        }

        const employeeId = parseInt(req.params.employeeId);
        if (isNaN(employeeId))
            throw new E.ParamTypeError('employeeId', req.params.employeeId, 1);

        await assignEmployeeRoles(companyId, employeeId, req.body.roles);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findCompanyRoles = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const includeRights = `${req.query.rights}`.toLowerCase() === 'true' ? true : false;

        const roles = await findRoles({ companyId, includeRights });
        const results = roles.length === 0 ? undefined : roles;

        res.status(200).send(r.success200(results));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findRoleById = async (req, res, next) => {
    try {
        const { companyId, roleId } = req.params;

        const [role] = await findRoles({ companyId, roleId, includeRights: true });
        if (!role) throw new E.NotFoundError('role');

        res.status(200).send(r.success200(role));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEmployeeRights = async (req, res, next) => {
    try {
        const { companyId, employeeId, moduleId } = req.params;

        const { edit = false, approve = false } = await findRights(employeeId, companyId, moduleId);

        res.status(200).send(r.success200({ edit, approve }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findApprovingEmployees = async (req, res, next) => {
    try {
        const { companyId, moduleId } = req.params;

        const results = await findEmployeesByModuleRight(companyId, 'approve', moduleId);

        res.status(200).send(r.success200(results));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEditingEmployees = async (req, res, next) => {
    try {
        const { companyId, moduleId } = req.params;

        const results = await findEmployeesByModuleRight(companyId, 'edit', moduleId);

        res.status(200).send(r.success200(results));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// UPDATE

module.exports.editRole = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // must check for permission to assign roles if not a system admin
        if (decoded.admin_level !== 2) {
            // const { edit } = findRights(decoded.employee_id, companyId, "m05_03");
            throw new E.PermissionError('edit role');
        }

        const roleId = parseInt(req.params.roleId);
        if (isNaN(roleId))
            throw new E.ParamTypeError('roleId', req.params.roleId, 1);

        await editRole(companyId, roleId, req.body);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// DELETE

module.exports.deleteRole = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // must check for permission to assign roles if not a system admin
        if (decoded.admin_level !== 2) {
            // const { edit } = findRights(decoded.employee_id, companyId, "m05_03");
            throw new E.PermissionError('edit role');
        }

        const roleId = parseInt(req.params.roleId);
        if (isNaN(roleId))
            throw new E.ParamTypeError('roleId', req.params.roleId, 1);

        await deleteRole(roleId, companyId);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
