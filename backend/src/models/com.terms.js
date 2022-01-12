const {
    Employees,
    User: { Accounts },
    Documents: { TermsAndDefinitions }
} = require('../schemas/Schemas');

module.exports.insertTerms = async (data = {}) => {
    const {
        companyId: fk_company_id,
        edited_by,
        content
    } = data;

    const existingTerms = await TermsAndDefinitions.findOne({ fk_company_id });

    // update the existing reference if it exists
    // otherwise make a new one
    const result = existingTerms
        ? await existingTerms.update({ edited_by, content })
        : await TermsAndDefinitions.create({ fk_company_id, edited_by, content });

    return result;
};

// ============================================================

module.exports.findTerms = (fk_company_id) => TermsAndDefinitions.findOne({
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
