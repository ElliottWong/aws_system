const {
    Companies,
    Employees,
    User: { Accounts }
} = require('../schemas/Schemas');

const { ADMIN_LEVEL, ACCOUNT_STATUS, ORGANISATION_STATUS } = require('../config/enums');

const E = require('../errors/Errors');

module.exports.checkAccountStatus = async (req, res, next) => {
    try {
        const {
            auth: { decoded },
            account
        } = res.locals;

        // platform admin can skip check
        if (decoded.admin_level === ADMIN_LEVEL.EISO) return next();

        if (account.status !== ACCOUNT_STATUS.ACTIVE)
            throw new E.AccountStatusError(account.status);

        return next();
    }
    catch (error) {
        return next(error);
    }
};

module.exports.checkCompanyStatus = async (req, res, next) => {
    try {
        const { company_id, admin_level } = res.locals.auth.decoded;

        // platform admin can skip check
        if (admin_level === ADMIN_LEVEL.EISO) return next();

        const company = await Companies.findOne({
            where: { company_id },
            attributes: ['status']
        });

        if (company.status !== ORGANISATION_STATUS.ACTIVE)
            throw new E.OrganisationStatusError(company.status);

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// should no longer use
module.exports.checkAccountAndCompanyStatus = async (req, res, next) => {
    try {
        const { decoded: { account_id, admin_level } } = res.locals.auth;

        // platform admin can bypass this check
        if (admin_level === 1) return next();

        const account = await Accounts.findOne({
            where: { account_id },
            attributes: ['status'],
            include: {
                model: Employees,
                as: 'employee',
                attributes: ['fk_company_id'],
                include: {
                    model: Companies,
                    as: 'company',
                    attributes: ['status']
                }
            }
        });

        if (account.status !== 'active') throw new E.AccountStatusError(account.status);

        const { company } = account.employee;

        if (company.status !== 'active') throw new E.OrganisationStatusError(company.status);

        return next();
    }
    catch (error) {
        return next(error);
    }
};
