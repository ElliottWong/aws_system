const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { Policies }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

module.exports.insertPolicy = (data = {}) => {
    const {
        companyId: fk_company_id,
        created_by,
        approved_by,
        title,
        policies = []
    } = data;

    return Policies.Forms.create({
        fk_company_id,
        title, created_by, approved_by,
        status: DOCUMENT_STATUS.PENDING,
        items: policies
    }, { include: 'items' });
};

// ============================================================

module.exports.findBlockingPolicy = (fk_company_id) => Policies.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.in]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.findPolicies = ({ where = {}, includeItems = true, ...others } = {}) => {
    // provide operators so controller does not need to import it
    const w = typeof where === 'function' ? where(Op) : where;

    // construct the join queries
    const join = {
        include: [{
            model: Employees,
            as: 'author',
            include: {
                model: Accounts,
                as: 'account',
                attributes: ['username']
            }
        }, {
            model: Employees,
            as: 'approver',
            include: {
                model: Accounts,
                as: 'account',
                attributes: ['username']
            }
        }]
    };

    if (includeItems) {
        join.include.push('items');
        join.order = [[Policies.Forms.associations.items, 'display_order', 'ASC']];
    }

    return Policies.Forms.findAll({ where: w, ...join, ...others });
};

// ============================================================

module.exports.deletePolicy = async (fk_company_id, policy_id, force = false) => {
    const destroyForm = Policies.Forms.destroy({
        where: { fk_company_id, policy_id },
        force
    });

    const destroyItems = Policies.Items.destroy({
        where: { fk_policy_id: policy_id },
        force
    });

    const destroyed = await Promise.all([destroyForm, destroyItems]);
    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
