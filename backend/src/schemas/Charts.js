// CLAUSE 5.3

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Files = db.model('Files');

const OrgCharts = db.define(
    'OrgCharts',
    {
        chart_id: {
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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fk_file_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Files,
                key: 'file_id'
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
        display_order: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        }
        // parent_item_id: {
        //     type: DataTypes.INTEGER.UNSIGNED,
        //     allowNull: true,
        //     defaultValue: null,
        //     references: {
        //         model: this,
        //         key: "chart_id"
        //     }
        // }
    },
    {
        tableName: 'org_charts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(OrgCharts, {
    foreignKey: 'fk_company_id'
});

OrgCharts.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Files.hasOne(OrgCharts, {
    foreignKey: 'fk_file_id'
});

OrgCharts.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

Employees.hasMany(OrgCharts, {
    foreignKey: 'created_by'
});

OrgCharts.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

// optional self-reference r/s
// for swot items that have a parent
// CompanyCharts.hasOne(CompanyCharts, {
//     foreignKey: "parent_item_id",
//     as: "child"
// });

// CompanyCharts.belongsTo(CompanyCharts, {
//     foreignKey: "parent_item_id",
//     as: "parent"
// });

module.exports = { OrgCharts };
