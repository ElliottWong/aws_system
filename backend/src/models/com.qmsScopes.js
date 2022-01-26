const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { QmsScope }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

module.exports.insertQmsScope = (data = {}) => {
    const {
        companyId: fk_company_id,
        created_by, approved_by,
        title, content,
        boundaries = []
    } = data;

    return QmsScope.Forms.create({
        fk_company_id,
        created_by, approved_by,
        title, content,
        status: DOCUMENT_STATUS.PENDING,
        items: boundaries
    }, { include: 'items' });
};

// ============================================================

module.exports.findBlockingQmsScope = (fk_company_id) => QmsScope.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.in]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.findQmsScopes = ({ where = {}, includeItems = true, ...others } = {}) => {
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
        join.order = [[QmsScope.Forms.associations.items, 'display_order', 'ASC']];
    }

    return QmsScope.Forms.findAll({ where: w, ...join, ...others });
};

// ============================================================

module.exports.deleteQmsScope = async (fk_company_id, qms_scope_id, force = false) => {
    const destroyForm = QmsScope.Forms.destroy({
        where: { fk_company_id, qms_scope_id },
        force
    });

    const destroyItems = QmsScope.Items.destroy({
        where: { fk_qms_scope_id: qms_scope_id },
        force
    });

    const destroyed = await Promise.all([destroyForm, destroyItems]);
    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
