const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Accounts = db.model('Accounts');

const Otps = db.define(
    'Otps',
    {
        otp_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: Accounts,
                key: 'account_id'
            }
        },
        code: {
            type: DataTypes.CHAR(6),
            allowNull: false
        }
    },
    {
        tableName: 'otps',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    }
);

Accounts.hasOne(Otps, {
    foreignKey: 'fk_account_id',
    as: 'otp'
});

Otps.belongsTo(Accounts, {
    foreignKey: 'fk_account_id',
    as: 'account'
});

module.exports = { Otps };
