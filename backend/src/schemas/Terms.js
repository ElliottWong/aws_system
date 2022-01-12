// CLAUSE 3

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonIntroductory } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const TermsAndDefinitions = db.define(
    'TermsAndDefinitions',
    {
        term_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        ...commonIntroductory({ Companies, Employees })
    },
    {
        tableName: 'introductory_terms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasOne(TermsAndDefinitions, {
    foreignKey: 'fk_company_id'
});

TermsAndDefinitions.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(TermsAndDefinitions, {
    foreignKey: 'edited_by'
});

TermsAndDefinitions.belongsTo(Employees, {
    foreignKey: 'edited_by',
    as: 'author'
});

module.exports = { TermsAndDefinitions };
