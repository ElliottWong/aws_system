// CLAUSE 7.3 ABC
// training is yet another word without a plural form (in UK english)

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Files = db.model('Files');

const TrainingRequests = db.define(
    'TrainingRequests',
    {
        training_id: {
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
        // ENUM approved (in progress, evaluation, done)/pending/rejected
        status: {
            type: DataTypes.ENUM([
                'pending',
                'approved',
                'rejected',
                'cancelled' // like archives/paranoid delete
            ]),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        training_start: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        training_end: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        training_institution: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        training_cost: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        justification_text: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        justification_upload: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: Files,
                key: 'file_id'
            }
        },
        // for rejection reason
        remarks: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        // for anything else
        comments: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        attendance_upload: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: Files,
                key: 'file_id'
            }
        },
        evaluation: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        trainee_evaluation_done: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        supervisor_evaluation_done: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
        // because system is stupid, 
        // users must indicate their evaluation completion manually
        // it is possible to just loop thru an array and check for "answer" property
        // to determine whether a question has been answered
    },
    {
        tableName: 'training_requests',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

Companies.hasMany(TrainingRequests, {
    foreignKey: 'fk_company_id'
});

TrainingRequests.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

Employees.hasMany(TrainingRequests, {
    foreignKey: 'created_by'
});

TrainingRequests.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

Employees.hasMany(TrainingRequests, {
    foreignKey: 'approved_by'
});

TrainingRequests.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

Files.hasOne(TrainingRequests, {
    foreignKey: 'justification_upload'
});

TrainingRequests.belongsTo(Files, {
    foreignKey: 'justification_upload',
    as: 'justification_file'
});

Files.hasOne(TrainingRequests, {
    foreignKey: 'attendance_upload'
});

TrainingRequests.belongsTo(Files, {
    foreignKey: 'attendance_upload',
    as: 'attendance_file'
});

module.exports = { TrainingRequests };
