const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');

const TrainingEvaluationTemplates = db.define(
    'TrainingEvaluationTemplates',
    {
        evaluation_template_id: {
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
        created_by: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Employees,
                key: 'employee_id'
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        version: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        template: {
            type: DataTypes.JSON,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        tableName: 'training_evaluation_templates',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(TrainingEvaluationTemplates, {
    foreignKey: 'fk_company_id'
});

TrainingEvaluationTemplates.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(TrainingEvaluationTemplates, {
    foreignKey: 'created_by'
});

TrainingEvaluationTemplates.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

module.exports = { TrainingEvaluationTemplates };
