// CLAUSE 7.1

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Files = db.model('Files');

// table names were too long lol
// DatabaseError [SequelizeDatabaseError]: Identifier name 'company_equipment_responsible_employees_fk_equipment_id_fk_employee_id_unique' is too long

const EquipmentTypes = db.define(
    'EquipmentTypes',
    {
        equipment_type_id: {
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
            allowNull: true
        }
    },
    {
        tableName: 'company_emp_types',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(EquipmentTypes, {
    foreignKey: 'fk_company_id'
});

EquipmentTypes.belongsTo(Companies, {
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
        fk_equipment_type_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: EquipmentTypes,
                key: 'equipment_type_id'
            }
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
        maintenance_frequency_number: {
            type: DataTypes.INTEGER({ unsigned: true, length: 2 }),
            allowNull: false
        },
        maintenance_frequency_type: {
            type: DataTypes.ENUM(['week', 'month', 'year']),
            allowNull: false
        },
        // to determine when the maintenance cycle begin
        last_service_at: {
            type: 'TIMESTAMP',
            allowNull: false
        },
        // the backend can first calculate when the next service is due
        // next_service_at: {
        //     type: 'TIMESTAMP',
        //     allowNull: false
        // },
        // like the deleted_at column
        // if null means not archived
        archived_at: {
            type: 'TIMESTAMP',
            allowNull: true
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

EquipmentTypes.hasMany(Equipment, {
    foreignKey: 'fk_equipment_type_id',
    as: 'equipment'
});

Equipment.belongsTo(EquipmentTypes, {
    foreignKey: 'fk_equipment_type_id',
    as: 'type'
});

// maintenance is also a word without a plural form
const EquipmentMaintenance = db.define(
    'EquipmentMaintenance',
    {
        maintenance_id: {
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: 'company_emp_maintenance',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Equipment.hasMany(EquipmentMaintenance, {
    foreignKey: 'fk_equipment_id',
    as: 'maintenance'
});

EquipmentMaintenance.belongsTo(Equipment, {
    foreignKey: 'fk_equipment_id',
    as: 'equipment'
});

// this is a many to many join table
const ResponsibleEmployees = db.define(
    'ResponsibleEmployees',
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
        fk_maintenance_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: EquipmentMaintenance,
                key: 'maintenance_id'
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

Employees.belongsToMany(EquipmentMaintenance, {
    through: ResponsibleEmployees,
    foreignKey: 'fk_employee_id',
    as: 'maintenance'
});

EquipmentMaintenance.belongsToMany(Employees, {
    through: ResponsibleEmployees,
    foreignKey: 'fk_maintenance_id',
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
        fk_maintenance_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: EquipmentMaintenance,
                key: 'maintenance_id'
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
        fk_file_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Files,
                key: 'file_id'
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

EquipmentMaintenance.hasMany(EquipmentUploads, {
    foreignKey: 'fk_maintenance_id',
    as: 'uploads'
});

EquipmentUploads.belongsTo(EquipmentMaintenance, {
    foreignKey: 'fk_maintenance_id',
    as: 'maintenance'
});

Employees.hasMany(EquipmentUploads, {
    foreignKey: 'created_by'
});

EquipmentUploads.belongsTo(Employees, {
    foreignKey: 'created_by'
});

Files.hasMany(EquipmentUploads, {
    foreignKey: 'fk_file_id'
});

EquipmentUploads.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

module.exports = {
    CompanyEquipmentTypes: EquipmentTypes,
    CompanyEquipment: Equipment,
    CompanyEquipmentResponsibleEmployees: ResponsibleEmployees,
    CompanyEquipmentMaintenance: EquipmentMaintenance,
    CompanyEquipmentUploads: EquipmentUploads
};
