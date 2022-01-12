// USED FOR STORING INVITATIONS SENT OUT

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');

const Invitations = db.define(
    'Invitations',
    {
        invitation_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        token: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        sent_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Employees,
                key: 'employee_id'
            }
        },
        // while company id is connected to the employee, i may need it here directly
        // to determine the source of the invite
        fk_company_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // null for platform admins
            allowNull: true,
            defaultValue: null,
            references: {
                model: Companies,
                key: 'company_id'
            }
        }
    },
    {
        tableName: 'invitations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

// TODO r/s on FKs
// but i doubt there is a need since it is unlikely that a join query is necessary

module.exports = { Invitations };
