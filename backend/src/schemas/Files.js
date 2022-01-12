const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Employees = db.model('Employees');

const Files = db.define(
    'Files',
    {
        file_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        // the original file name
        // there may be other file name fields else where, but those are for display only
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        cloudinary_id: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        cloudinary_uri: {
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
        }
    },
    {
        tableName: 'files',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Employees.hasMany(Files, {
    foreignKey: 'created_by',
    as: 'files'
});

Files.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'owner'
});

// https://sequelize.org/master/class/lib/associations/base.js~Association.html
Employees.belongsTo(Files, {
    foreignKey: 'profile_picture',
    as: 'avatar',
    constraints: false
});

module.exports = { Files };
