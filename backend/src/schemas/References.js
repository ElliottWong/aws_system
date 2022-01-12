// CLAUSE 2

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonIntroductory } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');

const References = db.define(
    'References',
    {
        reference_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        ...commonIntroductory({ Companies, Employees })
    },
    {
        tableName: 'introductory_references',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasOne(References, {
    foreignKey: 'fk_company_id'
});

References.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(References, {
    foreignKey: 'edited_by'
});

References.belongsTo(Employees, {
    foreignKey: 'edited_by',
    as: 'author'
});

module.exports = { References };
