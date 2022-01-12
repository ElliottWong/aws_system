const {
    insertCompany,
    findCompanies,
    editCompany
} = require('../models/companies');

const { ADMIN_LEVEL } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertCompany = async (req, res, next) => {
    try {
        const { company_id } = await insertCompany(req.body);
        res.status(201).send(r.success201({ company_id }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllCompanies = async (req, res, next) => {
    try {
        const companies = await findCompanies({ include: 'address' });
        res.status(200).send(r.success200(companies));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findCompanyById = async (req, res, next) => {
    try {
        const { companyId: company_id } = req.params;

        const [company] = await findCompanies({
            where: { company_id },
            include: 'address'
        });
        if (!company) throw new E.NotFoundError('company');

        res.status(200).send(r.success200(company));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// UPDATE

// i will make this only available to the system admin or the platform admin
module.exports.editCompany = async (req, res, next) => {
    try {
        const { decoded } = res.locals.auth;
        const { company_id } = req.params;

        const allowed = [ADMIN_LEVEL.EISO, ADMIN_LEVEL.SUPER].includes(decoded.admin_level);
        if (!allowed) throw new E.AdminError('edit company');

        await editCompany(company_id, req.body, decoded.admin_level);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
