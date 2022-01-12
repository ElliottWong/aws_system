const { Op } = require('sequelize');

const {
    Employees,
    Role: { Roles }
} = require('../schemas/Schemas');

const { ACCOUNT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');

module.exports.findEmployees = ({ where = {}, includeRoles, includeAddress, includeCompany, ...others } = {}) => {
    // provide operators so controller does not need to import it
    const w = typeof where === 'function' ? where(Op) : where;

    const include = [
        { association: 'account', attributes: ['username', 'status'] },
        'avatar'
    ];

    if (includeRoles) include.push({
        model: Roles,
        as: 'roles',
        // dont want any of the join table data
        through: { attributes: [] }
    });

    if (includeAddress) include.push('address');

    if (includeCompany) include.push('company');

    return Employees.findAll({ where: w, include, ...others });
};

// ============================================================

module.exports.editEmployee = async (data = {}) => {
    const {
        fk_company_id, employee_id,
        employee,
        address, admin_level,
        account_status
    } = data;

    const include = [];
    if (address) include.push('address');
    if (account_status) include.push('account');

    const employeeRow = await Employees.findOne({
        where: { fk_company_id, employee_id },
        include
    });
    if (!employeeRow) throw new E.NotFoundError('employee');

    const promises = [];
    if (employee) promises.push(employeeRow.update(employee));
    // update the address if necessary
    if (address) promises.push(employeeRow.address.update(address));

    // update the account status if necessary
    if (account_status) {
        // cannot change the account status if it is locked by system
        if (employeeRow.account.status === ACCOUNT_STATUS.LOCKED)
            throw new E.AccountStatusError(ACCOUNT_STATUS.LOCKED);
        promises.push(employeeRow.account.update({ status: account_status }));
    }

    await Promise.all(promises);
};
