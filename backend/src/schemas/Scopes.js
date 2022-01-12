// CLAUSE 1

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonIntroductory } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const Scopes = db.define(
    'Scopes',
    {
        scope_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        ...commonIntroductory({ Companies, Employees })
    },
    {
        tableName: 'introductory_scopes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasOne(Scopes, {
    foreignKey: 'fk_company_id'
});

Scopes.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(Scopes, {
    foreignKey: 'edited_by'
});

Scopes.belongsTo(Employees, {
    foreignKey: 'edited_by',
    as: 'author'
});

module.exports = { Scopes };
