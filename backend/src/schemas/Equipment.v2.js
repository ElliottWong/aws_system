// CLAUSE 7.1

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Files = db.model('Files');

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
        equipment_type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
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
        model: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        maintenance_type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // from a physics point of view, more accurately a period
        // the period is number of days calculated from
        // the amount of a unit time
        maintenance_frequency_multiplier: {
            // 1 to 99
            type: DataTypes.INTEGER({ unsigned: true, length: 2 }),
            allowNull: false
        },
        maintenance_frequency_unit_time: {
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
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        days_left_pct: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
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
        tableName: 'company_emp_equipment',
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

// this is a many to many join table
const EquipmentAssignees = db.define(
    'EquipmentAssignees',
    {
        equipment_responsible_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        // i thought that since this join table is already joining so much info
        // it might as well include the equipment id so it will easier 
        fk_equipment_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Equipment,
                key: 'equipment_id'
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
        tableName: 'company_emp_assignees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Employees.belongsToMany(Equipment, {
    through: EquipmentAssignees,
    foreignKey: 'fk_employee_id'
});

Equipment.belongsToMany(Employees, {
    through: EquipmentAssignees,
    foreignKey: 'fk_equipment_id',
    as: 'assignees'
});

const EquipmentUploads = db.define(
    'EquipmentUploads',
    {
        equipment_upload_id: {
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
        serviced_at: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
        // remarks: {
        //     type: DataTypes.STRING(255),
        //     allowNull: false
        // }
    },
    {
        tableName: 'company_emp_uploads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Equipment.hasMany(EquipmentUploads, {
    foreignKey: 'fk_equipment_id',
    as: 'uploads'
});

EquipmentUploads.belongsTo(Equipment, {
    foreignKey: 'fk_equipment_id',
    as: 'equipment'
});

Files.hasMany(EquipmentUploads, {
    foreignKey: 'fk_file_id'
});

EquipmentUploads.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

Employees.hasMany(EquipmentUploads, {
    foreignKey: 'created_by'
});

EquipmentUploads.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'creator'
});

module.exports = {
    Equipment,
    EquipmentAssignees,
    EquipmentUploads
};
