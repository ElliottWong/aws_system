const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Accounts } = require('../schemas/Schemas').User;

const {
    jwt: { secret: jwtSecret },
    cookie: { secret: cookieSecret }
} = require('../config/config');

const { ADMIN_LEVEL, ORGANISATION_STATUS, ACCOUNT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');

const includeEmployee = {
    association: 'employee',
    include: { association: 'company', attributes: ['name', 'alias', 'status'] }
};

const includeActivePassword = {
    association: 'passwords',
    where: { active: true }, limit: 1
};

module.exports.clientLogin = async (username, password) => {
    const account = await Accounts.findOne({
        where: { username },
        include: [includeEmployee, includeActivePassword]
    });

    if (!account) throw new E.AccountNotFoundError();

    if (account.employee.admin_level === ADMIN_LEVEL.EISO)
        throw new E.LoginError();

    // company is suspended, no login for employees of this company
    if (account.employee.company.status === ORGANISATION_STATUS.SUSPENDED)
        throw new E.OrganisationStatusError(ORGANISATION_STATUS.SUSPENDED);

    const activePassword = account.passwords[0];

    if (account.status === ACCOUNT_STATUS.LOCKED || activePassword.attempts > 5)
        throw new E.AccountStatusError(ACCOUNT_STATUS.LOCKED);

    if (account.status === ACCOUNT_STATUS.DEACTIVATED)
        throw new E.AccountStatusError(ACCOUNT_STATUS.DEACTIVATED);

    const isCorrectPassword = bcrypt.compareSync(password, activePassword.password);

    // wrong password
    if (!isCorrectPassword) {
        const attempts = activePassword.attempts + 1;
        await activePassword.update({ attempts });

        // account is locked on the 5th try
        if (attempts >= 5) {
            await account.update({ status: ACCOUNT_STATUS.LOCKED });
            throw new E.AccountStatusError(ACCOUNT_STATUS.LOCKED);
        }

        throw new E.IncorrectPasswordError();
    }

    // correct password
    // reset password attempts
    if (activePassword.attempts > 0) await activePassword.update({ attempts: 0 });

    const accessToken = jwt.sign({
        username: account.username,
        account_uuid: account.account_uuid,
        company_id: account.employee.fk_company_id,
        employee_id: account.employee.employee_id,
        admin_level: account.employee.admin_level,
        // user data
        display_name: `${account.employee.firstname} ${account.employee.lastname}`,
        display_title: account.employee.title,
        email: account.employee.email,
        company_name: account.employee.company.name,
        company_alias: account.employee.company.alias
    }, jwtSecret, { expiresIn: '6h' });

    const refreshToken = jwt.sign({
        account_uuid: account.account_uuid
    }, cookieSecret, { expiresIn: '24h' });

    return [accessToken, refreshToken];
};

// ============================================================

module.exports.adminLogin = async (username, password) => {
    const account = await Accounts.findOne({
        where: { username },
        include: [includeEmployee, includeActivePassword]
    });
    if (!account) throw new E.AccountNotFoundError();

    if (account.employee.admin_level !== ADMIN_LEVEL.EISO)
        throw new E.LoginError();

    const activePassword = account.passwords[0];

    if (account.status === ACCOUNT_STATUS.LOCKED || activePassword.attempts > 5)
        throw new E.AccountStatusError(ACCOUNT_STATUS.LOCKED);

    if (account.status === ACCOUNT_STATUS.DEACTIVATED)
        throw new E.AccountStatusError(ACCOUNT_STATUS.DEACTIVATED);

    const isCorrectPassword = bcrypt.compareSync(password, activePassword.password);

    // wrong password
    if (!isCorrectPassword) {
        const attempts = activePassword.attempts + 1;
        await activePassword.update({ attempts });

        // account is locked on the 5th try
        if (attempts >= 5) {
            await account.update({ status: ACCOUNT_STATUS.LOCKED });
            throw new E.AccountStatusError(ACCOUNT_STATUS.LOCKED);
        }

        throw new E.IncorrectPasswordError();
    }

    // correct password
    // reset password attempts
    if (activePassword.attempts > 0) await activePassword.update({ attempts: 0 });

    const accessToken = jwt.sign({
        username: account.username,
        account_uuid: account.account_uuid,
        // no company id
        employee_id: account.employee.employee_id,
        admin_level: account.employee.admin_level,
        // user data
        display_name: `${account.employee.firstname} ${account.employee.lastname}`,
        display_title: account.employee.title,
        email: account.employee.email
        // no company name
        // no company alias
    }, jwtSecret, { expiresIn: '6h' });

    const refreshToken = jwt.sign({
        account_uuid: account.account_uuid
    }, cookieSecret, { expiresIn: '24h' });

    return [accessToken, refreshToken];
};

// ============================================================

// for both users and platform admins
// maybe should be seperate?
module.exports.useRefreshToken = async (refreshToken) => {
    const { account_uuid } = jwt.verify(refreshToken, cookieSecret);

    const account = await Accounts.findOne({
        where: { account_uuid },
        include: includeEmployee
    });
    if (!account) throw new E.AccountNotFoundError();

    const newAccessToken = jwt.sign({
        username: account.username,
        account_uuid: account.account_uuid,
        company_id: account.employee.fk_company_id ?? undefined,
        employee_id: account.employee.employee_id,
        admin_level: account.employee.admin_level,
        // user data
        display_name: `${account.employee.firstname} ${account.employee.lastname}`,
        display_title: account.employee.title,
        email: account.employee.email,
        company_name: account.employee.company?.name ?? undefined,
        company_alias: account.employee.company?.alias ?? undefined
    }, jwtSecret, { expiresIn: '6h' });

    const newRefreshToken = jwt.sign({
        account_uuid: account.account_uuid
    }, cookieSecret, { expiresIn: '24h' });

    return [newAccessToken, newRefreshToken];
};
