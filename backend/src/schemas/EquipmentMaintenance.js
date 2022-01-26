// CLAUSE 7.1
// maintenance

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Equipment = db.model('Equipment');
const Files = db.model('Files');

const Maintenance = db.define(
    'Maintenance',
    {
        maintenance_id: {
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
        fk_equipment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Equipment,
                key: 'equipment_id'
            }
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // description: {
        //     type: DataTypes.STRING(255),
        //     allowNull: true,
        //     defaultValue: null
        // },
        // the frequency the is number of days calculated from
        // the amount of unit time
        freq_multiplier: {
            // 1 to 99
            type: DataTypes.INTEGER({ unsigned: true, length: 2 }),
            allowNull: false
        },
        freq_unit_time: {
            // 7 | 30 | 365 (week | month | year)
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
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
        // to determine when the maintenance cycle begin
        last_service_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        next_service_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
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
        }
    },
    {
        tableName: 'emp_maintenance',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(Maintenance, {
    foreignKey: 'fk_company_id'
});

Maintenance.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Equipment.hasMany(Maintenance, {
    foreignKey: 'fk_equipment_id',
    as: 'maintenance'
});

Maintenance.belongsTo(Equipment, {
    foreignKey: 'fk_equipment_id',
    as: 'equipment'
});

const MaintenanceUploads = db.define(
    'MaintenanceUploads',
    {
        maintenance_upload_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_maintenance_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Maintenance,
                key: 'maintenance_id'
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
        description: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        serviced_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },
    {
        tableName: 'emp_maintenance_uploads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Maintenance.hasMany(MaintenanceUploads, {
    foreignKey: 'fk_maintenance_id',
    as: 'uploads'
});

MaintenanceUploads.belongsTo(Maintenance, {
    foreignKey: 'fk_maintenance_id',
    as: 'maintenance'
});

Files.hasMany(MaintenanceUploads, {
    foreignKey: 'fk_file_id'
});

MaintenanceUploads.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

Employees.hasMany(MaintenanceUploads, {
    foreignKey: 'created_by'
});

MaintenanceUploads.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

// this is a many to many join table
const MaintenanceAssignees = db.define(
    'MaintenanceAssignees',
    {
        maintenance_assignee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        // this column allows us to skip going thru Maintenance
        // so we can get all employees who are assigned to the equipment via Maintenance
        fk_equipment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'fk_eqp_id',
            references: {
                model: Equipment,
                key: 'equipment_id'
            }
        },
        fk_maintenance_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'fk_mnt_id',
            references: {
                model: Equipment,
                key: 'equipment_id'
            }
        },
        fk_employee_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'fk_usr_id',
            references: {
                model: Employees,
                key: 'employee_id'
            }
        }
    },
    {
        tableName: 'emp_maintenance_assignees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Equipment.hasMany(MaintenanceAssignees, {
    foreignKey: 'fk_eqp_id'
});

MaintenanceAssignees.belongsTo(Equipment, {
    foreignKey: 'fk_eqp_id'
});

Employees.belongsToMany(Maintenance, {
    through: MaintenanceAssignees,
    foreignKey: 'fk_usr_id'
});

Maintenance.belongsToMany(Employees, {
    through: MaintenanceAssignees,
    foreignKey: 'fk_mnt_id',
    as: 'assignees'
});

module.exports = {
    Maintenance,
    MaintenanceUploads,
    MaintenanceAssignees
};
