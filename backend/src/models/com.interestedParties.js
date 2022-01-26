const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { InterestedParties }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

// CREATE

module.exports.insertParty = async (data = {}) => {
    const {
        companyId: fk_company_id,
        title,
        created_by,
        approved_by,
        interested_parties = []
    } = data;

    const parentForm = await InterestedParties.Forms.create({
        fk_company_id,
        title, created_by, approved_by,
        status: DOCUMENT_STATUS.PENDING
    });

    const { party_id: fk_party_id } = parentForm;

    try {
        // row { interested_party, expectations, display_order, parent_item_id }
        const insertions = interested_parties.map((row) => {
            return { ...row, fk_party_id };
        });

        await InterestedParties.Items.bulkCreate(insertions);
    }
    catch (error) {
        parentForm.destroy({ force: true });
        throw error;
    }

    return parentForm;
};

// ============================================================

// READ

module.exports.findBlockingParty = (fk_company_id) => InterestedParties.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.in]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.findParties = ({ where, includeItems = true, ...others } = {}) => {
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
        join.order = [[InterestedParties.Forms.associations.items, 'display_order', 'ASC']];
    }

    return InterestedParties.Forms.findAll({ where: w, ...join, ...others });
};

// ============================================================

module.exports.deleteParty = async (fk_company_id, party_id, force = false) => {
    const destroyForm = InterestedParties.Forms.destroy({
        where: { fk_company_id, party_id },
        force
    });

    const destroyItems = InterestedParties.Items.destroy({
        where: { fk_party_id: party_id },
        force
    });

    const destroyed = await Promise.all([destroyForm, destroyItems]);
    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
