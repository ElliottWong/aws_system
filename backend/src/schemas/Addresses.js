const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Addresses = db.define(
    'Addresses',
    {
        address_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        address_line_one: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        address_line_two: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        postal_code: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'addresses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

module.exports = { Addresses };
