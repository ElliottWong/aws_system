// CLAUSE 7.1
// equipment

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');

const Categories = db.define(
    'Categories',
    {
        category_id: {
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'emp_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(Categories, {
    foreignKey: 'fk_company_id'
});

Categories.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

// equipment apparently is a word without a plural form
// english is cursed
const Equipment = db.define(
    'Equipment',
    {
        equipment_id: {
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
        // equipment_type: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false
        // },
        reference_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        register_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        serial_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        name:{
            type: DataTypes.STRING(255),
            allowNull: false
        },
        model: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // like the deleted_at column
        // if null means not archived
        archived_at: {
            type: 'TIMESTAMP',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'emp_equipment',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// company
Companies.hasMany(Equipment, {
    foreignKey: 'fk_company_id'
});

Equipment.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

// author employee
Employees.hasMany(Equipment, {
    foreignKey: 'created_by'
});

Equipment.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

const Equipment2Categories = db.define(
    'Equipment2Categories',
    {
        equipment_categories_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_equipment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Equipment,
                key: 'equipment_id'
            }
        },
        fk_category_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Categories,
                key: 'category_id'
            }
        }
    },
    {
        tableName: 'emp_equipment_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Equipment.belongsToMany(Categories, {
    through: Equipment2Categories,
    foreignKey: 'fk_equipment_id',
    as: 'categories'
});

Categories.belongsToMany(Equipment, {
    through: Equipment2Categories,
    foreignKey: 'fk_category_id',
    as: 'equipment'
});

module.exports = {
    Equipment,
    Categories,
    Equipment2Categories
};
