// CLAUSE 6.1

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');
const SwotItems = db.model('SwotItems');

const RisksAnalysesForms = db.define(
    'RisksAnalysesForms',
    {
        risks_analysis_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        ...commonForm({ Companies, Employees })
    },
    {
        tableName: 'ro_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

Companies.hasMany(RisksAnalysesForms, {
    foreignKey: 'fk_company_id'
});

RisksAnalysesForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(RisksAnalysesForms, {
    foreignKey: 'created_by'
});

RisksAnalysesForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

Employees.hasMany(RisksAnalysesForms, {
    foreignKey: 'approved_by'
});

RisksAnalysesForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const RisksAnalysesItems = db.define(
    'RisksAnalysesItems',
    {
        risk_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_risks_analysis_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: RisksAnalysesForms,
                key: 'risks_analysis_id'
            }
        },
        fk_swot_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: SwotItems,
                key: 'swot_item_id'
            }
        },
        // risk or opportunity
        type: {
            type: DataTypes.ENUM(['risk', 'opportunity']),
            allowNull: true,
            defaultValue: null
        },
        severity: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        likelihood: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        rpn: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        action: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        parent_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: this,
                key: 'risk_item_id'
            }
        }
    },
    {
        tableName: 'ro_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

RisksAnalysesForms.hasMany(RisksAnalysesItems, {
    foreignKey: 'fk_risks_analysis_id',
    as: 'items'
});

RisksAnalysesItems.belongsTo(RisksAnalysesForms, {
    foreignKey: 'fk_risks_analysis_id',
    as: 'form'
});

SwotItems.hasOne(RisksAnalysesItems, {
    foreignKey: 'fk_swot_item_id',
    as: 'analysis'
});

RisksAnalysesItems.belongsTo(SwotItems, {
    foreignKey: 'fk_swot_item_id',
    as: 'swot'
});

// optional self-reference r/s
// for swot items that have a parent
RisksAnalysesItems.hasOne(RisksAnalysesItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

RisksAnalysesItems.belongsTo(RisksAnalysesItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

module.exports = {
    RisksAnalysesForms,
    RisksAnalysesItems
};
