// CLAUSE 4.1

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const SwotForms = db.define(
    'SwotForms',
    {
        swot_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        ...commonForm({ Companies, Employees })
    },
    {
        tableName: 'swot_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// swots belongs to a company
Companies.hasMany(SwotForms, {
    foreignKey: 'fk_company_id'
});

SwotForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

// swots belong to an employee who authored it
Employees.hasMany(SwotForms, {
    foreignKey: 'created_by'
});

SwotForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

// swots also belong to an employee that approves
Employees.hasMany(SwotForms, {
    foreignKey: 'approved_by'
});

SwotForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const SwotItems = db.define(
    'SwotItems',
    {
        swot_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_swot_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: SwotForms,
                key: 'swot_id'
            }
        },
        type: {
            type: DataTypes.ENUM(['strength', 'weakness', 'opportunity', 'threat']),
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
                key: 'swot_item_id'
            }
        }
    },
    {
        tableName: 'swot_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// swot items
SwotForms.hasMany(SwotItems, {
    foreignKey: 'fk_swot_id',
    as: 'items'
});

SwotItems.belongsTo(SwotForms, {
    foreignKey: 'fk_swot_id',
    as: 'form'
});

// optional self-reference r/s
// for swot items that have a parent
SwotItems.hasOne(SwotItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

SwotItems.belongsTo(SwotItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

module.exports = {
    SwotForms,
    SwotItems
};
