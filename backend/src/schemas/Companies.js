const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Addresses = db.model('Addresses');

const Companies = db.define(
    'Companies',
    {
        company_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        alias: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        business_registration_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fk_address_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Addresses,
                key: 'address_id'
            }
        },
        status: {
            type: DataTypes.ENUM(['active', 'suspended']),
            allowNull: false,
            defaultValue: 'active'
        }
    },
    {
        tableName: 'companies',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// A one-to-one r/s where Companies references Addresses
Addresses.hasOne(Companies, {
    foreignKey: 'fk_address_id',
    as: 'company'
});

Companies.belongsTo(Addresses, {
    foreignKey: 'fk_address_id',
    as: 'address'
});

module.exports = { Companies };
