const {
    Employees,
    Role: { Roles, Rights: RoleRights }
} = require('../schemas/Schemas');

const { enumValues, MODULE } = require('../config/enums');
const moduleKeys = enumValues(MODULE);

const E = require('../errors/Errors');

// i extracted these functions out of the controller 
// so that anything else can call these functions
// idk if theres any use of this
// i suppose it was getting quite long so i took it out

// CREATE

module.exports.insertRole = async (companyId, meta) => {
    const { name, responsibility, rights } = meta;

    // check if the name has already been used for another role
    // in that company
    const existingRole = await Roles.findOne({
        where: { name, fk_company_id: companyId },
        attributes: ['name']
    });
    if (existingRole) throw new E.DuplicateError('role', 'name');

    const roleRights = moduleKeys.map((key) => {
        // using bracket notation on object
        const { edit = false, approve = false } = rights[key] ?? {};
        return { module: key, edit, approve };
    });

    const role = await Roles.create({
        name, responsibility,
        fk_company_id: companyId,
        rights: roleRights
    }, { include: 'rights' });

    return role;
};

// ============================================================

// roles is an array of role_ids
module.exports.assignEmployeeRoles = async (companyId, employeeId, roles = []) => {
    const employee = await Employees.findOne({
        where: {
            employee_id: employeeId,
            fk_company_id: companyId
        }
    });
    if (!employee) throw new E.NotFoundError('employee');

    // here i want to find out if the roles being assigned can be done so
    // such as a role must be assigned to an employee in the same organisation

    const promises = roles.map((roleId) => Roles.findByPk(roleId, { attributes: ['fk_company_id'] }));
    const foundRoles = await Promise.all(promises);

    const notFound = foundRoles.some((role) => !!role);
    if (notFound) throw new E.NotFoundError('role');

    const invalidRoleAssignment = foundRoles.some((role) => role.fk_company_id !== companyId);
    if (invalidRoleAssignment) throw new E.ForeignOrganisationError();

    // this set method will add new assignments if any
    // and any prior assignments not included will be lost
    employee.setRoles(roles);
};

// ============================================================

// READ

module.exports.findRoles = async (options = {}) => {
    const {
        companyId,
        roleId,
        includeRights = false
    } = options;

    const where = { fk_company_id: companyId };
    if (roleId !== undefined) where.role_id = roleId;

    const include = [];
    if (includeRights) include.push('rights');

    const roles = await Roles.findAll({ where, include });

    if (includeRights) {
        const results = roles.map((role) => {
            role = role.toJSON();
            // get the rights data out of role via destructuring
            const { rights } = role;
            // reassign role.rights as an object
            role.rights = {};

            // assigns the modules objects to rights object
            rights.forEach((right) => {
                const { module: key } = right;
                role.rights[key] = right;
            });
            return role;
        });
        return results;
    }

    return roles;
};

// ============================================================

module.exports.findEmployeesByModuleRight = async (companyId, right, module) => {
    const employees = await Employees.findAll({
        where: {
            fk_company_id: companyId
        },
        include: [{
            association: 'account',
            attributes: ['username', 'status']
        }, {
            association: 'roles',
            include: {
                association: 'rights',
                // variable property name in []
                where: { module, [right]: true }
            }
        }]
    });

    const results = [];
    employees.forEach((employee) => {
        // separate roles from the employees object
        const { roles, ...e } = employee.toJSON();

        // the employee has roles that grant approve/edit rights
        // add to results
        if (roles.length > 0) results.push(e);
    });

    return results;
};

// ============================================================

// given an employee and a module
// find whether the employee has rights to that module
// across all roles

/**
 * Finds an employee and their roles, returns boolean values
 * for whether if an employee has rights to 
 * edit/approve a given module
 * @param {number} employee_id Employee Id
 * @param {number} fk_company_id Company Id
 * @param {string} module Module Key
 */
module.exports.findRights = async (employee_id, fk_company_id, module) => {
    const foundEmployee = await Employees.findOne({
        where: { employee_id, fk_company_id },
        include: {
            model: Roles,
            as: 'roles',
            include: {
                model: RoleRights,
                as: 'rights',
                where: { module }
            }
        }
    });
    if (!foundEmployee) throw new E.NotFoundError('employee');

    // default to false
    let moduleEdit = false, moduleApprove = false;

    // storing the array length outside is faster as
    // the loop does not have to keep reading it on every iteration
    const l = foundEmployee.roles.length;
    for (let i = 0; i < l; i++) {
        const { edit = false, approve = false } = foundEmployee.roles[i].rights[0];
        if (edit) moduleEdit = true;
        if (approve) moduleApprove = true;

        // exit loop as the user already has all the rights
        // this may come sooner than when the loop iterates thru all the roles
        if (moduleEdit && moduleApprove) break;
    }

    // // another way to do this but perhaps less efficient

    // let permissions = { edit: false, approve: false };

    // foundEmployee.roles.forEach(role => {
    //     const { edit = false, approve = false } = role.rights[0] ?? {};
    //     if (edit) permissions.edit = true;
    //     if (approve) permissions.approve = true;
    // });

    return {
        // found: true,
        employee: foundEmployee,
        edit: moduleEdit,
        approve: moduleApprove
        // ...permissions
    };
};

// ============================================================

// UPDATE

module.exports.editRole = async (companyId, roleId, content) => {
    const role = await Roles.findOne({
        where: {
            role_id: roleId,
            fk_company_id: companyId
        }
    });
    if (!role) throw new E.NotFoundError('role');

    const { name, responsibility, rights } = content;

    // if the property is undefined, sequelize ignores it
    const updatedRole = await role.update({ name, responsibility });

    /*  this is left out, read line 109
        // if the client data doesn't include rights (no changes)
        // can skip everything below
        if (!rights) return true;
    */

    // gets all the rights available to the role
    const currentRights = await updatedRole.getRights();

    // this set is like an array that does not contain duplicates
    const keyTrack = new Set(moduleKeys);

    const promises = currentRights.map((right) => {
        // go thru the client data with the index of the currently available rights in the db
        const { module: key } = right;
        const { edit, approve } = rights[key] ?? {};
        return right.update({ edit, approve });
    });

    // allSettled deals with all the promises, regardless whether
    // each is resolved or rejected
    // rather than all, which throws an error once even one promise
    // is rejected, and unsettled promises are cancelled
    const settled = await Promise.allSettled(promises);

    // delete from keyTrack successfully updated rows
    settled.forEach((promise) => {
        if (promise.status === 'fulfilled') keyTrack.delete(promise.value.module);
    });

    // if there are remaining moduleKeys that didnt exist before; for when:
    // a new module is added
    // a role (for some reason) doesnt have a record specifying rights to a module
    const newModuleRights = [...keyTrack].map((key) => {
        // check if the request body contains this key
        // the client cannot falsely add new module keys
        const { edit = false, approve = false } = rights[key] ?? {};
        return {
            fk_role_id: updatedRole.role_id,
            module: key,
            edit, approve
        };
    });

    await RoleRights.bulkCreate(newModuleRights);

    // i did the above so that when a new module is added in the future, 
    // only the moduleKeys array need to be updated with new module keys
};

// ============================================================

module.exports.deleteRole = async (role_id, fk_company_id) => {
    const found = await Roles.findOne({
        where: { role_id, fk_company_id },
        include: 'rights'
    });
    if (!found) throw new E.NotFoundError('role');

    return await found.destroy();
};
