const {
    Employees,
    User: { Accounts },
    Documents: { NormativeReferences }
} = require('../schemas/Schemas');

module.exports.insertReference = async (data = {}) => {
    const {
        companyId: fk_company_id,
        edited_by,
        content
    } = data;

    const existingReference = await NormativeReferences.findOne({ fk_company_id });

    // update the existing reference if it exists
    // otherwise make a new one
    const result = existingReference
        ? await existingReference.update({ edited_by, content })
        : await NormativeReferences.create({ fk_company_id, edited_by, content });

    return result;
};

// ============================================================

module.exports.findReference = (fk_company_id) => NormativeReferences.findOne({
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
