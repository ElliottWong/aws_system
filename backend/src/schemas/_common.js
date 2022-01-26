const { DataTypes } = require('sequelize');

// The common table columns for document forms
// ie Clauses 4.1, 6.1, etc
module.exports.commonForm = ({ Companies, Employees }) => ({
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
    approved_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Employees,
            key: 'employee_id'
        }
    },
    approved_at: {
        type: 'TIMESTAMP',
        allowNull: true,
        defaultValue: null
    },
    expired_at: {
        type: 'TIMESTAMP',
        allowNull: true,
        defaultValue: null
    },
    status: {
        // ENUM data type maps each valid string value to an index starting at 1
        // 1 = active, 2 = pending, ...
        // Only the specified values below are valid in string
        type: DataTypes.ENUM(['active', 'pending', 'rejected', 'archived']),
        allowNull: false
    },
    remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    }
});

// Used for Clauses 1 - 3
module.exports.commonIntroductory = ({ Companies, Employees }) => ({
    fk_company_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Companies,
            key: 'company_id'
        }
    },
    content: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    edited_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Employees,
            key: 'employee_id'
        }
    }
});
