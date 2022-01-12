// CLAUSE 4.2

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const InterestedPartiesForms = db.define(
    'InterestedPartiesForms',
    {
        party_id: {
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
        tableName: 'interested_parties_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

Companies.hasMany(InterestedPartiesForms, {
    foreignKey: 'fk_company_id'
});

InterestedPartiesForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(InterestedPartiesForms, {
    foreignKey: 'created_by'
});

InterestedPartiesForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

Employees.hasMany(InterestedPartiesForms, {
    foreignKey: 'approved_by'
});

InterestedPartiesForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const InterestedPartiesItems = db.define(
    'InterestedPartiesItems',
    {
        party_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_party_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: InterestedPartiesForms,
                key: 'party_id'
            }
        },
        interested_party: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        expectations: {
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
                key: 'party_item_id'
            }
        }
    },
    {
        tableName: 'interested_parties_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

InterestedPartiesForms.hasMany(InterestedPartiesItems, {
    foreignKey: 'fk_party_id',
    as: 'items'
});

InterestedPartiesItems.belongsTo(InterestedPartiesForms, {
    foreignKey: 'fk_party_id',
    as: 'form'
});

// optional self-reference r/s
// for swot items that have a parent
InterestedPartiesItems.hasOne(InterestedPartiesItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

InterestedPartiesItems.belongsTo(InterestedPartiesItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

module.exports = {
    InterestedPartiesForms,
    InterestedPartiesItems
};
