// CLAUSE 4.3

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const QmsScopeForms = db.define(
    'QmsScopeForms',
    {
        qms_scope_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // this content field includes formatting
        // the formatted text is stored as a string JSON
        content: {
            type: DataTypes.TEXT({ length: 'medium' }),
            allowNull: false
        },
        ...commonForm({ Companies, Employees })
    },
    {
        tableName: 'qms_scope_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

Companies.hasMany(QmsScopeForms, {
    foreignKey: 'fk_company_id'
});

QmsScopeForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(QmsScopeForms, {
    foreignKey: 'created_by'
});

QmsScopeForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

Employees.hasMany(QmsScopeForms, {
    foreignKey: 'approved_by'
});

QmsScopeForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const QmsScopeItems = db.define(
    'QmsScopeItems',
    {
        qms_scope_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_qms_scope_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: QmsScopeForms,
                key: 'qms_scope_id'
            }
        },
        site_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        site_scope: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // fk_address_id: {
        //     type: DataTypes.INTEGER.UNSIGNED,
        //     allowNull: false,
        //     references: {
        //         model: Addresses,
        //         key: "address_id"
        //     }
        // },
        address: {
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
                key: 'qms_scope_item_id'
            }
        }
    },
    {
        tableName: 'qms_scope_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

QmsScopeForms.hasMany(QmsScopeItems, {
    foreignKey: 'fk_qms_scope_id',
    as: 'items'
});

QmsScopeItems.belongsTo(QmsScopeForms, {
    foreignKey: 'fk_qms_scope_id',
    as: 'form'
});

// Addresses.hasOne(QmsScopeItems, {
//     foreignKey: "fk_address_id",
//     as: "qms_boundary"
// });

// QmsScopeItems.belongsTo(Addresses, {
//     foreignKey: "fk_address_id",
//     as: "address"
// });

// optional self-reference r/s
// for swot items that have a parent
QmsScopeItems.hasOne(QmsScopeItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

QmsScopeItems.belongsTo(QmsScopeItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

module.exports = {
    QmsScopeForms,
    QmsScopeItems
};
