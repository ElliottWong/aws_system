const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { SWOT }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

// CREATE

module.exports.insertSwot = (data = {}) => {
    const {
        companyId: fk_company_id,
        created_by,
        approved_by,
        strengths = [],
        weaknesses = [],
        opportunities = [],
        threats = []
    } = data;

    const s = strengths.map((strength) => ({
        ...strength, type: 'strength'
    }));

    const w = weaknesses.map((weakness) => ({
        ...weakness, type: 'weakness'
    }));

    const o = opportunities.map((opportunity) => ({
        ...opportunity, type: 'opportunity'
    }));

    const t = threats.map((threat) => ({
        ...threat, type: 'threat'
    }));

    const items = [...s, ...w, ...o, ...t];

    // all swots are pending by default
    return SWOT.Forms.create({
        fk_company_id,
        created_by, approved_by,
        status: DOCUMENT_STATUS.PENDING,
        items
    }, { include: 'items' });
};

// ============================================================

// READ

module.exports.findBlockingSwot = (fk_company_id) => SWOT.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.in]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.findSwots = async ({ where = {}, includeItems = true, unmodified = false, ...others } = {}) => {
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
        join.order = [
            [SWOT.Forms.associations.items, 'type', 'ASC'],
            [SWOT.Forms.associations.items, 'display_order', 'ASC']
        ];
    }

    const forms = await SWOT.Forms.findAll({ where: w, ...join, ...others });
    if (forms.length === 0) return [];

    if (!includeItems) return forms;
    if (unmodified) return forms;

    const results = forms.map((form) => {
        // cant work with object instances here, JSON is the object literal
        const { items, ...swot } = form.toJSON();
        // sort the swot items
        const strengths = [], weaknesses = [], opportunities = [], threats = [];

        items.forEach((item) => {
            const { type } = item;
            if (type === 'strength') return strengths.push(item);
            if (type === 'weakness') return weaknesses.push(item);
            if (type === 'opportunity') return opportunities.push(item);
            if (type === 'threat') return threats.push(item);
        });

        return { ...swot, strengths, weaknesses, opportunities, threats };
    });

    return results;
};

// ============================================================

module.exports.deleteSwot = async (fk_company_id, swot_id, force = false) => {
    const destroyForm = SWOT.Forms.destroy({
        where: { fk_company_id, swot_id },
        force
    });

    const destroyItems = SWOT.Items.destroy({
        where: { fk_swot_id: swot_id },
        force
    });

    const destroyed = await Promise.all([destroyForm, destroyItems]);
    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
