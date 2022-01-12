// CLAUSE 6.2

const { DataTypes } = require('sequelize');
const db = require('../config/connection');

const { commonForm } = require('./_common');
const Companies = db.model('Companies');
const Employees = db.model('Employees');
const Roles = db.model('Roles');
const Files = db.model('Files');

const ObjectiveAchievementForms = db.define(
    'ObjectiveAchievementForms',
    {
        achievement_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        ...commonForm({ Companies, Employees })
    },
    {
        tableName: 'oap_forms',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// company
Companies.hasMany(ObjectiveAchievementForms, {
    foreignKey: 'fk_company_id'
});

ObjectiveAchievementForms.belongsTo(Companies, {
    foreignKey: 'fk_company_id',
    as: 'company'
});

// author employee
Employees.hasMany(ObjectiveAchievementForms, {
    foreignKey: 'created_by'
});

ObjectiveAchievementForms.belongsTo(Employees, {
    foreignKey: 'created_by',
    as: 'author'
});

// approving employee
Employees.hasMany(ObjectiveAchievementForms, {
    foreignKey: 'approved_by'
});

ObjectiveAchievementForms.belongsTo(Employees, {
    foreignKey: 'approved_by',
    as: 'approver'
});

const ObjectiveAchievementItems = db.define(
    'ObjectiveAchievementItems',
    {
        achievement_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_achievement_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: ObjectiveAchievementForms,
                key: 'achievement_id'
            }
        },
        function: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        quality_objective: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        personel_responsible: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: Roles,
                key: 'role_id'
            }
        },
        data_collection: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        data_analysis: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        display_order: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        parent_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
            references: {
                model: this,
                key: 'achievement_item_id'
            }
        }
    },
    {
        tableName: 'oap_items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// document items
ObjectiveAchievementForms.hasMany(ObjectiveAchievementItems, {
    foreignKey: 'fk_achievement_id',
    as: 'items'
});

ObjectiveAchievementItems.belongsTo(ObjectiveAchievementForms, {
    foreignKey: 'fk_achievement_id',
    as: 'form'
});

// personel responsible
Roles.hasMany(ObjectiveAchievementItems, {
    foreignKey: 'personel_responsible'
});

ObjectiveAchievementItems.belongsTo(Roles, {
    foreignKey: 'personel_responsible',
    as: 'role'
});

// optional self-reference r/s
// for swot items that have a parent
ObjectiveAchievementItems.hasOne(ObjectiveAchievementItems, {
    foreignKey: 'parent_item_id',
    as: 'child'
});

ObjectiveAchievementItems.belongsTo(ObjectiveAchievementItems, {
    foreignKey: 'parent_item_id',
    as: 'parent'
});

const ObjectiveAchievementUploads = db.define(
    'ObjectiveAchievementUploads',
    {
        achievement_data_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        fk_achievement_item_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: ObjectiveAchievementItems,
                key: 'achievement_item_id'
            }
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        fk_file_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: Files,
                key: 'file_id'
            }
        }
    },
    {
        tableName: 'oap_uploads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at'
    }
);

// item uploads
ObjectiveAchievementItems.hasMany(ObjectiveAchievementUploads, {
    foreignKey: 'fk_achievement_item_id',
    as: 'data'
});

ObjectiveAchievementUploads.belongsTo(ObjectiveAchievementItems, {
    foreignKey: 'fk_achievement_item_id',
    as: 'item'
});

// uploaded files
// many items can share the same file
// this is because we dont want to reupload an unchanged file 
// everytime a new document is submitted, we want to reuse
Files.hasMany(ObjectiveAchievementUploads, {
    foreignKey: 'fk_file_id'
});

ObjectiveAchievementUploads.belongsTo(Files, {
    foreignKey: 'fk_file_id',
    as: 'file'
});

module.exports = {
    ObjectiveAchievementForms,
    ObjectiveAchievementItems,
    ObjectiveAchievementUploads
};
