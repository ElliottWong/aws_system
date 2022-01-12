const {
    Employees,
    User: { Accounts },
    Documents: { Scopes }
} = require('../schemas/Schemas');

module.exports.insertScope = async (data = {}) => {
    const {
        companyId: fk_company_id,
        edited_by,
        content
    } = data;

    const existingScope = await Scopes.findOne({ fk_company_id });

    // update the existing scope if it exists
    // otherwise make a new one
    const result = existingScope
        ? await existingScope.update({ edited_by, content })
        : await Scopes.create({ fk_company_id, edited_by, content });

    return result;
};

// ============================================================

module.exports.findScope = (fk_company_id) => Scopes.findOne({
    where: { fk_company_id },
    include: {
        model: Employees,
        as: 'author',
        include: {
            model: Accounts,
            as: 'account',
            attributes: ['username']
        }
    }
});
