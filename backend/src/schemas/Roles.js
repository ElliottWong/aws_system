// CLAUSE 5.3

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');

const { testModule } = require('../config/enums');

const Roles = db.define(
    'Roles',
    {
        role_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        responsibility: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fk_company_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Companies,
                key: 'company_id'
            }
        }
    },
    {
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(Roles, {
    foreignKey: 'fk_company_id',
    as: 'roles'
});

Roles.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

const RoleAssignments = db.define(
    'RoleAssignments',
    {
        assignment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_role_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Roles,
                key: 'role_id'
            }
        },
        fk_employee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Employees,
                key: 'employee_id'
            }
        }
    },
    {
        tableName: 'role_assignments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// Many-to-many relationship thru RoleAssignment
Employees.belongsToMany(Roles, {
    through: RoleAssignments,
    // fk in join table that references Employees
    foreignKey: 'fk_employee_id',
    as: 'roles'
});

Roles.belongsToMany(Employees, {
    through: RoleAssignments,
    // fk in join table that references Roles
    foreignKey: 'fk_role_id',
    as: 'employees'
});

const RoleRights = db.define(
    'RoleRights',
    {
        rights_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_role_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Roles,
                key: 'role_id'
            }
        },
        module: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                format(value) {
                    // this regex tests whether the input fits the format
                    // regex literal
                    // lowercase m, 2 digits 0-9, underscore, 2 digits 0-9
                    if (!testModule(value)) throw new Error('Invalid format for module codes');
                }
            }
        },
        edit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        approve: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'role_rights',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// One-to-many r/s for role rights (many modules per role)
Roles.hasMany(RoleRights, {
    foreignKey: 'fk_role_id',
    as: 'rights'
});

RoleRights.belongsTo(Roles, {
    foreignKey: 'fk_role_id',
    as: 'role'
});

module.exports = { Roles, RoleAssignments, RoleRights };
