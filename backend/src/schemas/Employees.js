const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Addresses = db.model('Addresses');
const Companies = db.model('Companies');

const Employees = db.define(
    'Employees',
    {
        employee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        firstname: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fk_company_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // this is now true so that platform admins are not tied to a company
            allowNull: true,
            defaultValue: null,
            references: {
                model: Companies,
                key: 'company_id'
            }
        },
        fk_address_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // made address optional after much confusion
            allowNull: true,
            defaultValue: null,
            references: {
                model: Addresses,
                key: 'address_id'
            }
        },
        // the admin level the employee has
        // 0 -> none
        // 1 -> platform admin
        // 2 -> company's system admins
        // 3 -> company's secondary admins
        admin_level: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: 'available'
        },
        profile_picture: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'employees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

Companies.hasMany(Employees, {
    foreignKey: 'fk_company_id',
    as: 'employees'
});

Employees.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});


Addresses.hasOne(Employees, {
    foreignKey: 'fk_address_id',
    as: 'employee'
});

Employees.belongsTo(Addresses, {
    foreignKey: 'fk_address_id',
    as: 'address'
});

module.exports = { Employees };
