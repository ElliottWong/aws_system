// this middleware is for validating if the user has access to company data they are trying to access
// users should only access their own company's data
// platform admins can access all data

const { ADMIN_LEVEL } = require('../config/enums');

const E = require('../errors/Errors');

// TODO this should be elsewhere
module.exports.parseIdParams = (req, res, next) => {
    try {
        const idParamNames = Object.keys(req.params).filter((paramName) => paramName.endsWith('Id'));

        for (const idParamName of idParamNames) {
            // skip moduleId (eg m04_01)
            if (idParamName === 'moduleId') continue;

            // only parse the values into decimal ints
            const parsedIntId = parseInt(req.params[idParamName], 10);

            if (isNaN(parsedIntId))
                throw new E.ParamTypeError(idParamName, req.params[idParamName], 1);

            req.params[idParamName] = parsedIntId;
        }

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// only employees of a company can access their own company's data
// also allows platform admin to access
module.exports.companyAccess = (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { decoded } = res.locals.auth;

        // platform admin can skip check
        if (decoded.admin_level === ADMIN_LEVEL.EISO) return next();

        // if the user is from company A but is accessing data in company B
        if (decoded.company_id !== companyId)
            throw new E.ForeignOrganisationError();

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// not even the platform admin can access
module.exports.onlyCompanyAccess = (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { decoded } = res.locals.auth;

        // platform admin cannot access the company data
        if (decoded.admin_level === ADMIN_LEVEL.EISO)
            throw new E.ForeignOrganisationError();

        // if the user is from company A but is accessing data in company B
        if (decoded.company_id !== companyId) throw new E.ForeignOrganisationError();

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// only platform admin can access
module.exports.onlyPlatformAdminAccess = (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;

        // only platform admin access
        if (decoded.admin_level !== ADMIN_LEVEL.EISO)
            throw new E.AdminError('access this feature');

        return next();
    }
    catch (error) {
        return next(error);
    }
};
