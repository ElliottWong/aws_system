const { Companies } = require('../schemas/Schemas');

const c = require('../services/cloudinary');
const E = require('../errors/Errors');

// CREATE

module.exports.insertCompany = async (meta) => {
    const { name, alias, description, business_registration_number, address } = meta;

    const company = await Companies.create({
        name, alias, description, business_registration_number, address,
        status: 'active'
    }, { include: 'address' });

    await Promise.all([
        c.createFolder(c.formDocumentsFolderPath(company.company_id, 'm05_03')),
        c.createFolder(c.formDocumentsFolderPath(company.company_id, 'm06_02'))
    ]);

    return company;
};

// ============================================================

module.exports.findCompanies = (options) => Companies.findAll(options);

// ============================================================

module.exports.editCompany = async (comapny_id, data, adminLevel) => {
    const company = await Companies.findByPk(comapny_id, { include: 'address' });
    if (!company) throw new E.OrganisationNotFoundError();

    const {
        name, alias,
        description,
        business_registration_number,
        status,
        address = null
    } = data;

    const details = { name, alias, description, business_registration_number };

    const canChangeStatus = adminLevel === 1 && status !== undefined;
    if (canChangeStatus) details.status = status;

    await company.update(details);

    // if the company address is provided
    if (address) await company.address.update(address);
};
