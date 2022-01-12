const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Employees = db.model('Employees');

const Accounts = db.define(
    'Accounts',
    {
        account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // type: DataTypes.UUID,
            // defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            autoIncrement: true
        },
        account_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        fk_employee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Employees,
                key: 'employee_id'
            }
        },
        status: {
            // active is the default state for the account
            // locked is when the password is invalidated
            // deactivated is when the account is closed, but the associated employee is not deleted for record tracking purposes
            type: DataTypes.ENUM(['active', 'locked', 'deactivated']),
            allowNull: false,
            defaultValue: 'active'
        }
    },
    {
        tableName: 'accounts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// A one-to-one r/s where Accounts references Employees
Employees.hasOne(Accounts, {
    foreignKey: 'fk_employee_id',
    as: 'account'
});

Accounts.belongsTo(Employees, {
    foreignKey: 'fk_employee_id',
    as: 'employee'
});

module.exports = { Accounts };
