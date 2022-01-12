// CLAUSE 5.2

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const PoliciesForms = db.define(
    'PoliciesForms',
    {
        policy_id: {
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
        tableName: 'policies_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

Companies.hasMany(PoliciesForms, {
    foreignKey: 'fk_company_id'
});

PoliciesForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(PoliciesForms, {
    foreignKey: 'created_by'
});

PoliciesForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

Employees.hasMany(PoliciesForms, {
    foreignKey: 'approved_by'
});

PoliciesForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const PoliciesItems = db.define(
    'PoliciesItems',
    {
        policy_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_policy_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: PoliciesForms,
                key: 'policy_id'
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        display_order: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        parent_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: this,
                key: 'policy_item_id'
            }
        }
    },
    {
        tableName: 'policies_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

PoliciesForms.hasMany(PoliciesItems, {
    foreignKey: 'fk_policy_id',
    as: 'items'
});

PoliciesItems.belongsTo(PoliciesForms, {
    foreignKey: 'fk_policy_id',
    as: 'form'
});

// optional self-reference r/s
// for swot items that have a parent
PoliciesItems.hasOne(PoliciesItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

PoliciesItems.belongsTo(PoliciesItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

module.exports = {
    PoliciesForms,
    PoliciesItems
};
