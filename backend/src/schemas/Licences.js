// CLAUSE 7.2

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Files = db.model('Files');

const Licences = db.define(
    'Licences',
    {
        licence_id: {
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
        licence_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        licence_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        external_organisation: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        issued_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        // there are also licences that are perpetual,
        // thus this field can be optional
        expires_at: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null
        },
        first_notification: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        second_notification: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        days_left: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        days_left_pct: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        archived_at: {
            type: 'TIMESTAMP',
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'plc_licences',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

// company
Companies.hasMany(Licences, {
    foreignKey: 'fk_company_id'
});

Licences.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

// author employee
Employees.hasMany(Licences, {
    foreignKey: 'created_by'
});

Licences.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

const LicenceAssignees = db.define(
    'LicenceAssignees',
    {
        licence_assignee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_licence_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Licences,
                key: 'licence_id'
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
        tableName: 'plc_assignees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Employees.belongsToMany(Licences, {
    through: LicenceAssignees,
    foreignKey: 'fk_employee_id'
});

Licences.belongsToMany(Employees, {
    through: LicenceAssignees,
    foreignKey: 'fk_licence_id',
    as: 'assignees'
});

// originally designed to be one to many
// now is one to one
// changed from hasMany to hasOne
const LicenceUploads = db.define(
    'LicenceUploads',
    {
        licence_upload_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_licence_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Licences,
                key: 'licence_id'
            }
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
        // can allow for a history of renewals
        issued_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: 'plc_uploads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Licences.hasOne(LicenceUploads, {
    foreignKey: 'fk_licence_id',
    as: 'upload'
});

LicenceUploads.belongsTo(Licences, {
    foreignKey: 'fk_licence_id',
    as: 'licence'
});

Files.hasMany(LicenceUploads, {
    foreignKey: 'fk_file_id'
});

LicenceUploads.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

Employees.hasMany(LicenceUploads, {
    foreignKey: 'created_by'
});

LicenceUploads.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'creator'
});

module.exports = { Licences, LicenceAssignees, LicenceUploads };
