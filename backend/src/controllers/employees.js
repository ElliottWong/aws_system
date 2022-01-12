const {
    findEmployees,
    editEmployee
} = require('../models/employees');

const {
    ACCOUNT_STATUS,
    ADMIN_LEVEL
} = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const validators = require('../middlewares/validator');
// CREATE
// there is no create here
// employees should be registered
// in invitation.js

// ============================================================

// READ

module.exports.findEmployees = async (req, res, next, isPlatformAdmin = false) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // if this controller is on the admin endpoint but for some reason
        // the token says the user is not a platform admin
        const wrongAdminLevel = isPlatformAdmin && decoded.admin_level !== ADMIN_LEVEL.EISO;
        if (wrongAdminLevel) throw new E.AdminError('access this feature');

        const includeRoles = `${req.query.roles}`.toLowerCase() === 'true' ? true : false;
        const includeAddress = `${req.query.address}`.toLowerCase() === 'true' ? true : false;
        const includeCompany = `${req.query.company}`.toLowerCase() === 'true' ? true : false;

        const where = isPlatformAdmin
            ? { fk_company_id: null, admin_level: 1 }
            : { fk_company_id: companyId };

        const employees = await findEmployees({
            where,
            includeRoles, includeAddress, includeCompany
        });

        res.status(200).send(r.success200(employees));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findEmployeeById = async (req, res, next, isPlatformAdmin = false) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // if this controller is on the admin endpoint but for some reason
        // the token says the user is not a platform admin
        const wrongAdminLevel = isPlatformAdmin && decoded.admin_level !== ADMIN_LEVEL.EISO;
        if (wrongAdminLevel) throw new E.AdminError('access this feature');

        const employeeId = parseInt(req.params.employeeId);
        if (isNaN(employeeId))
            throw new E.ParamTypeError('employeeId', req.params.employeeId, 1);

        const includeRoles = `${req.query.roles}`.toLowerCase() === 'true' ? true : false;
        const includeAddress = `${req.query.address}`.toLowerCase() === 'true' ? true : false;
        const includeCompany = `${req.query.company}`.toLowerCase() === 'true' ? true : false;

        const where = isPlatformAdmin
            ? { employee_id: employeeId, fk_company_id: null, admin_level: 1 }
            : { employee_id: employeeId, fk_company_id: companyId };

        const [employee] = await findEmployees({
            where,
            limit: 1,
            includeRoles, includeAddress, includeCompany
        });
        if (!employee) throw new E.NotFoundError('employee');

        res.status(200).send(r.success200(employee));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// UPDATE

// updates only employee details and their address
// does not include updating account (username/password)
// FIXME needs more work
// should really take out the isPlatformAdmin part
module.exports.editEmployee = async (req, res, next, isPlatformAdmin = false) => {
    try {
        const { decoded } = res.locals.auth;
        const { companyId } = req.params;

        // if this controller is on the admin endpoint but for some reason
        // the token says the user is not a platform admin
        const wrongAdminLevel = isPlatformAdmin && decoded.admin_level !== ADMIN_LEVEL.EISO;
        if (wrongAdminLevel) throw new E.AdminError('access this feature');

        const employeeId = parseInt(req.params.employeeId);
        if (isNaN(employeeId))
            throw new E.ParamTypeError('employeeId', req.params.employeeId, 1);

        const firstname  = validators.whitelistNameValidator(req.body.firstname);
        const lastname  = validators.whitelistNameValidator(req.body.lastname);
        const email = validators.validateEmail(req.body.email);
        let {
            title, status,
            admin_level,
            address,
            account_status
        } = req.body;

        // nobody should be manually locking an account
        if (account_status === ACCOUNT_STATUS.LOCKED)
            throw new E.ParamValueError('account_status');

        const include = [];
        if (address) include.push('address');
        if (account_status) include.push('account');

        const where = isPlatformAdmin
            ? {
                employee_id: employeeId,
                fk_company_id: null,
                admin_level: 1
            }
            : {
                employee_id: employeeId,
                fk_company_id: companyId
            };

        const [employee] = await findEmployees({ where, include, limit: 1 });
        if (!employee) throw new E.NotFoundError('employee');

        const details = { firstname, lastname, email };

        // as a system admin...
        if (decoded.admin_level === ADMIN_LEVEL.SUPER) {
            details.title = title;
            details.status = status;

            // dont allow the system admin to change their own admin_level
            if (decoded.employee_id !== employeeId) {
                // just admin_level is from req.body
                if (admin_level !== undefined) {
                    admin_level = parseInt(admin_level);

                    if (isNaN(admin_level))
                        throw new E.ParamTypeError('admin_level', admin_level, 1);

                    if (admin_level === 1 || admin_level === 2)
                        throw new E.ParamValueError('admin_level');

                    details.admin_level = admin_level;
                }
            }
        }

        if (isPlatformAdmin) {
            details.title = title;
            details.status = status;
        }

        await employee.update(details);

        // update the address if necessary
        if (address) await employee.address.update(address);

        // update the account status only when its necessary
        if (account_status !== undefined) {
            // as a system admin...
            // can only change the status when the account status is not locked
            // should only be either active or deactivated
            const isSystemAdmin = decoded.admin_level === ADMIN_LEVEL.SUPER && employee.account.status !== ACCOUNT_STATUS.LOCKED;
            if (isSystemAdmin) {
                // prevent the system admin from deactivating themself
                if (decoded.employee_id === employeeId)
                    throw new E.AccountError('Cannot deactivate oneself', true, employee.account.status);

                await employee.account.update({ status: account_status });
            }
        }

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// DELETE

// i dont think there is such a thing as truly deleting an employee
// the employee's account should be terminated/deactivated, but the employee
// should still be represented in the system, for their past work
