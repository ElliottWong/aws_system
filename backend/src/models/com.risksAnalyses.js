const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts },
    Documents: { RO, SWOT }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

// CREATE

module.exports.insertAnalysis = (data = {}) => {
    const {
        companyId: fk_company_id,
        created_by,
        approved_by,
        title,
        strengths = [],
        weaknesses = [],
        opportunities = [],
        threats = []
    } = data;

    const i = [...strengths, ...weaknesses, ...opportunities, ...threats];
    const items = i.map((item) => {
        const { swot_item_id: fk_swot_item_id, ...rest } = item;
        return { fk_swot_item_id, ...rest };
    });

    return RO.Forms.create({
        fk_company_id,
        created_by, approved_by,
        title,
        status: DOCUMENT_STATUS.PENDING,
        items
    }, { include: 'items' });
};

// ============================================================

// READ

module.exports.findBlockingAnalysis = (fk_company_id) => RO.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.or]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.lockAnalysis = async () => {
    const blockingSwot = await SWOT.Forms.findOne({
        where: {
            status: { [Op.or]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
        },
        attributes: ['swot_id']
    });
    if (blockingSwot) return [true, blockingSwot.swot_id];
    return [false, null];
};

// ============================================================

module.exports.findAnalyses = async ({ where = {}, includeItems = true, unmodified = false, ...others } = {}) => {
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
        join.include.push({
            model: RO.Items,
            as: 'items',
            include: {
                model: SWOT.Items,
                as: 'swot'
            },
            order: [
                [RO.Items.associations.swot, 'type', 'ASC'],
                [RO.Items.associations.swot, 'display_order', 'ASC']
            ]
        });
    }

    const found = await RO.Forms.findAll({ where: w, ...join, ...others });
    if (found.length === 0) return [];

    if (!includeItems) return found;
    if (unmodified) return found;

    const results = found.map((form) => {
        const { items, ...analysis } = form.toJSON();
        const strengths = [], weaknesses = [], opportunities = [], threats = [];

        items.forEach((item) => {
            const { type } = item.swot;
            if (type === 'strength') return strengths.push(item);
            if (type === 'weakness') return weaknesses.push(item);
            if (type === 'opportunity') return opportunities.push(item);
            if (type === 'threat') return threats.push(item);
        });

        return { ...analysis, strengths, weaknesses, opportunities, threats };
    });

    return results;
};

// ============================================================

// UPDATE

/**
 * Takes the current active analysis and modifies it to match a given new SWOT  
 * The reason it needs the arguement is because the function fails to find the actual new active SWOT,
 * it may still think the old one is the current active
 * @param {number} fk_company_id Company id
 * @param {number} swot_id The new SWOT id
 */
module.exports.matchActiveSwot = async (fk_company_id, swot_id) => {
    const activeSwot = await SWOT.Forms.findOne({
        where: { swot_id, fk_company_id },
        include: {
            model: SWOT.Items,
            as: 'items',
            include: 'parent'
        }
    });

    let activeAnalysis = await RO.Forms.findOne({
        where: { fk_company_id, status: DOCUMENT_STATUS.ACTIVE },
        include: 'items'
    });

    // but for the very first SWOT, there will be no first RO
    // so need to create

    const { created_by, approved_by, approved_at } = activeSwot;

    if (!activeAnalysis) {
        activeAnalysis = await RO.Forms.create({
            title: 'New Risks and Opportunities (RO) Analysis',
            fk_company_id, created_by, approved_by,
            status: DOCUMENT_STATUS.ACTIVE,
            approved_at
        });
        activeAnalysis.items = [];
    }

    // insertions can use bulkCreate, so this is an array of objects
    const analysisItemInsertions = [];

    // updates can use the id, so this is an object where its keys are ids
    // and each consist of a number
    const analysisItemUpdates = {};

    let analysisItemIds = activeAnalysis.items.map((analysisItem) => analysisItem.risk_item_id);
    analysisItemIds = new Set(analysisItemIds);

    activeSwot.items.forEach((swotItem) => {
        const {
            swot_item_id: swotItemId,
            parent_item_id: swotItemParentId,
            parent: swotItemParent
        } = swotItem;

        // the swot item is new
        if (swotItemParentId === null) analysisItemInsertions.push({
            fk_risks_analysis_id: activeAnalysis.risks_analysis_id,
            fk_swot_item_id: swotItemId
        });

        // otherwise, loop thru analysis items to match the swotItem
        else activeAnalysis.items.forEach((analysisItem) => {
            const {
                risk_item_id: analysisItemId,
                fk_swot_item_id: analysisItemSwotItemId
            } = analysisItem;
            // if the analysis item has a reference to a swot item
            // of which its id is being referenced by a newer swot item
            if (analysisItemSwotItemId === swotItemParent.swot_item_id) {
                analysisItemUpdates[analysisItemId] = swotItemId;
                analysisItemIds.delete(analysisItemId);
            }
        });
    });

    // create new items, if any
    if (analysisItemInsertions.length > 0) await RO.Items.bulkCreate(analysisItemInsertions);

    // update items, if any
    const anaylsisItemUpdateKeys = Object.keys(analysisItemUpdates);
    if (anaylsisItemUpdateKeys.length > 0) {
        const promises = anaylsisItemUpdateKeys.map((key) => RO.Items.update({
            fk_swot_item_id: analysisItemUpdates[key]
        }, { where: { risk_item_id: key } }));
        await Promise.all(promises);
    }

    // delete items, if any
    // any ids left inside of analysisItemIds are items which were not dealt with,
    // which means that their dependency (swot item) is gone
    if (analysisItemIds.size > 0) {
        const promises = [...analysisItemIds].map((id) => RO.Items.destroy({
            where: { risk_item_id: id }
        }));
        await Promise.all(promises);
    }
};

// ============================================================

// DELETE

module.exports.deleteAnalysis = async (fk_company_id, risks_analysis_id, force = false) => {
    const destroyForm = RO.Forms.destroy({
        where: { fk_company_id, risks_analysis_id },
        force
    });

    const destroyItems = RO.Items.destroy({
        where: { fk_risks_analysis_id: risks_analysis_id },
        force
    });

    const destroyed = await Promise.all([destroyForm, destroyItems]);
    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
