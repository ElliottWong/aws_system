// CLAUSE 7.3 D

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');

const InductionTemplates = db.define(
    'InductionTemplates',
    {
        induction_template_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_company_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Companies,
                key: 'company_id'
            }
        },
        induction: {
            type: DataTypes.STRING(1024),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        version: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Employees,
                key: 'employee_id'
            }
        },
        effective_at: {
            type: 'TIMESTAMP',
            allowNull: false
        }
    },
    {
        tableName: 'induction_templates',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = { InductionTemplates };
