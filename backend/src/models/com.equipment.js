// yes, most of these are overdone

const { Sequelize, Op } = require('sequelize');
const db = require('../config/connection');

const {
    Documents: { EMP }
} = require('../schemas/Schemas');

const E = require('../errors/Errors');

module.exports.insertCategory = async (companyId, category = {}) => {
    const { name, description } = category;

    // check whether the company already 
    // has an existing category with the same name
    // where clauses are case insensitive
    const count = await EMP.Categories.count({ where: { name } });
    if (count) throw new E.DuplicateError('category', 'name');

    const row = await EMP.Categories.create({
        fk_company_id: companyId,
        name, description
    });

    return row;
};

// ============================================================

module.exports.insertOneEquipment = async (companyId, createdBy, equipment = {}) => {
    const {
        reference_number,
        register_number,
        serial_number,
        name,
        model,
        location,
        categories = []
    } = equipment;

    const transaction = await db.transaction();
    try {
        const insertedEquipment = await EMP.Equipment.create({
            fk_company_id: companyId,
            created_by: createdBy,
            reference_number,
            register_number,
            serial_number,
            name,
            model,
            location
        }, { transaction });

        // no categories, return early
        if (!categories.length) {
            await transaction.commit();
            return insertedEquipment;
        }

        const categoryInsertions = categories.map((categoryId) => ({
            fk_equipment_id: insertedEquipment.equipment_id,
            fk_category_id: categoryId
        }));

        await EMP.Equipment2Categories.bulkCreate(categoryInsertions, { transaction });

        await transaction.commit();
        return insertedEquipment;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

const $includeAuthor = {
    association: 'author',
    include: {
        association: 'account',
        attributes: ['username']
    }
};

const $includeCategories = {
    association: 'categories',
    through: { attributes: [] }
};

const $includeMaintenanceAssignees = {
    association: 'assignees',
    include: {
        association: 'account',
        attributes: ['username']
    },
    through: { attributes: [] }
};

const $includeMaintenanceUploads = {
    association: 'uploads',
    include: {
        association: 'file',
        attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
    }
};

// ============================================================

const isAssignedEquipment = async (equipmentId, employeeId) => {
    const rows = await EMP.MaintenanceAssignees.findAll({
        where: {
            fk_equipment_id: equipmentId,
            fk_employee_id: employeeId
        },
        attributes: ['fk_maintenance_id']
    });

    const isAssigned = !!rows.length;
    const maintenanceIds = rows.map((row) => row.fk_maintenance_id);

    return [isAssigned, maintenanceIds];
};

const isEquipmentOwner = async (equipmentId, companyId, employeeId) => {
    const count = await EMP.Equipment.count({
        col: EMP.Equipment.primaryKeyAttribute,
        where: {
            equipment_id: equipmentId,
            fk_company_id: companyId,
            created_by: employeeId
        }
    });

    const isOwner = count === 1;
    return isOwner;
};

const getAssignedEquipmentIds = async (employeeId) => {
    // https://stackoverflow.com/a/41529165
    // only selects an equipment once given that an employee is 
    // assigned one or more maintenance under said equipment
    const selectDistinctEquipment = [
        // --------------------- this thing wants the real table col name as in the database
        Sequelize.fn('DISTINCT', Sequelize.col(EMP.MaintenanceAssignees.rawAttributes['fk_equipment_id'].field)),
        'fk_equipment_id' // SELECT AS
    ];

    const assignedEquipment = await EMP.MaintenanceAssignees.findAll({
        attributes: [selectDistinctEquipment],
        where: { fk_employee_id: employeeId }
    });

    const equipmentIds = assignedEquipment.map((row) => row.fk_equipment_id);
    return equipmentIds;
};

// regardless of equipment, maintenance ids
const getAssignedMaintenance = (employeeId) => EMP.MaintenanceAssignees.findAll({
    attributes: [
        [EMP.MaintenanceAssignees.rawAttributes['fk_maintenance_id'].field, 'maintenance_id'],
        [EMP.MaintenanceAssignees.rawAttributes['fk_equipment_id'].field, 'equipment_id']
    ],
    where: { fk_employee_id: employeeId }
});

// here i think the function expression looks better than lambdas
// to get all the maintenance for an equipment
// optionally if given the employee, 
// only get those maintenance that the employee is assigned
const getIncludeMaintenance = async function ({
    employeeId = null,
    includeAssignees,
    includeUploads
}) {
    const join = {
        association: 'maintenance',
        include: []
    };

    if (includeAssignees) join.include.push($includeMaintenanceAssignees);

    if (includeUploads) join.include.push($includeMaintenanceUploads);

    if (employeeId === null) return join;

    const assignedMaintenance = await getAssignedMaintenance(employeeId);

    // for some reason i cannot directly access the values
    const assignedMaintenanceIds = assignedMaintenance.map((row) => row.toJSON().maintenance_id);

    join.where = { maintenance_id: { [Op.in]: assignedMaintenanceIds } };
    return join;
};

// to get all the equipment a maintenance has
// optionally if given the employee,
// only get those equipment with maintenance that the employee is assigned
const getIncludeEquipment = async function ({
    employeeId = null,
    includeCategories = false,
    includeMaintenance = false,
    includeMaintenanceAssignees = false,
    includeMaintenanceUploads = false,
    archivedOnly = false
}) {
    // TODO check whether the include where clause will actually also filter out 
    // equipment which are not assigned to a given employee
    // -> yes

    let include = [$includeAuthor];

    if (includeCategories) include = [...include, $includeCategories];

    if (includeMaintenance) {
        const maintenanceInclude = await getIncludeMaintenance({
            employeeId,
            includeAssignees: includeMaintenanceAssignees,
            includeUploads: includeMaintenanceUploads
        });
        include = [...include, maintenanceInclude];
    }

    const join = {
        association: 'equipment',
        where: { archived_at: archivedOnly ? { [Op.not]: null } : null },
        include,
        through: { attributes: [] }
    };

    return join;
};

// ============================================================

module.exports.helpers = {
    includes: {
        author: $includeAuthor,
        categories: $includeCategories,
        maintenanceAssignees: $includeMaintenanceAssignees,
        maintenanceUploads: $includeMaintenanceUploads
    },
    isEquipmentOwner,
    isAssignedEquipment,
    getIncludeEquipment,
    getIncludeMaintenance,
    getAssignedEquipmentIds,
    getAssignedMaintenance
};

// ============================================================

module.exports.findCategories = {
    /**
     * Find all categories  
     * @param {number} companyId Company
     * @returns Model
     */
    all: (companyId) => {
        const where = { fk_company_id: companyId };
        return EMP.Categories.findAll({ where });
    },

    // FIXME will not work if category has no equipment
    /**
     * Find one category and its equipment  
     * When provided with `employeeId`, finds responsible equipment
     * @param {number} categoryId Category
     * @param {number} companyId Company
     * @param {number?} employeeId Employee
     * @param {boolean?} archivedOnly Only archived equipment?
     * @returns Model
     * @deprecated
     */
    one: async (categoryId, companyId, employeeId = null, archivedOnly = false) => {
        const _includeEquipment = await getIncludeEquipment({
            employeeId,
            includeCategories: true,
            includeMaintenance: true,
            includeMaintenanceAssignees: true,
            includeMaintenanceUploads: true,
            archivedOnly
        });

        const where = {
            category_id: categoryId,
            fk_company_id: companyId
        };

        const include = [_includeEquipment];

        const category = await EMP.Categories.findOne({ where, include });
        return category.equipment;
    }
};

// ============================================================

module.exports.findEquipment = {
    /**
     * Find all equipment and their categories, maintenance  
     * Maintenance will also include assignees and uploads
     * @param {number} comapnyId Company
     * @param {boolean?} archivedOnly Only archived equipment?
     * @returns Model
     */
    all: async (comapnyId, archivedOnly = false) => {
        const _includeMaintenance = await getIncludeMaintenance({
            includeAssignees: true,
            includeUploads: true
        });

        const where = {
            fk_company_id: comapnyId,
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = [$includeAuthor, $includeCategories, _includeMaintenance];

        const equipment = await EMP.Equipment.findAll({ where, include });
        return equipment;
    },

    /**
     * Find all equipment in a category  
     * @param {number} categoryId Category
     * @param {number} companyId Company
     * @param {boolean?} archivedOnly Only archived equipment?
     * @returns Category model and Equipment model[]
     */
    allInCategory: async (categoryId, companyId, archivedOnly = false) => {
        const category = await EMP.Categories.findOne({
            where: {
                category_id: categoryId,
                fk_company_id: companyId
            }
        });
        if (!category) throw new E.NotFoundError('category');

        const joinRows = await EMP.Equipment2Categories.findAll({
            where: { fk_category_id: categoryId },
            attributes: ['fk_equipment_id']
        });

        // if there are no equipment in a category
        if (!joinRows.length) return { category, equipment: [] };

        const equipmentIds = joinRows.map((row) => row.fk_equipment_id);

        const _includeMaintenance = await getIncludeMaintenance({
            includeAssignees: true,
            includeUploads: true
        });

        const where = {
            equipment_id: { [Op.in]: equipmentIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = [$includeAuthor, $includeCategories, _includeMaintenance];

        const equipment = await EMP.Equipment.findAll({ where, include });
        return { category, equipment };
    },

    /**
     * Find all responsible/assigned equipment and their categories, maintenance  
     * Maintenance will also include assignees and uploads
     * @param {number} employeeId Employee
     * @param {boolean?} archivedOnly Only archived equipment?
     * @returns Model
     */
    allResponsible: async (employeeId, archivedOnly = false) => {
        const assignedEquipmentIds = await getAssignedEquipmentIds(employeeId);

        // employee has no assigned equipment
        if (!assignedEquipmentIds.length) return [];

        const _includeMaintenance = await getIncludeMaintenance({
            employeeId,
            includeAssignees: true,
            includeUploads: true
        });

        const where = { archived_at: archivedOnly ? { [Op.not]: null } : null };
        const include = [$includeAuthor, $includeCategories, _includeMaintenance];

        const equipment = await EMP.Equipment.findAll({ where, include });
        return equipment;
    },

    /**
    * Find one category and its equipment  
    * When provided with `employeeId`, finds responsible equipment
    * @param {number} categoryId Category
    * @param {number} companyId Company
    * @param {number?} employeeId Employee
    * @param {boolean?} archivedOnly Only archived equipment?
    * @returns Category model and Equipment model[]
    */
    allResponsibleInCategory: async (categoryId, companyId, employeeId, archivedOnly = false) => {
        const category = await EMP.Categories.findOne({
            where: {
                category_id: categoryId,
                fk_company_id: companyId
            }
        });
        if (!category) throw new E.NotFoundError('category');

        const joinRows = await EMP.Equipment2Categories.findAll({
            where: { fk_category_id: categoryId },
            attributes: ['fk_equipment_id']
        });

        // if there are no equipment in a category
        if (!joinRows.length) return { category, equipment: [] };

        const equipmentIds = joinRows.map((row) => row.fk_equipment_id);

        const _includeMaintenance = await getIncludeMaintenance({
            employeeId,
            includeAssignees: true,
            includeUploads: true
        });

        const where = {
            equipment_id: { [Op.in]: equipmentIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = [$includeAuthor, $includeCategories, _includeMaintenance];

        const equipment = await EMP.Equipment.findAll({ where, include });
        return { category, equipment };
    },

    /**
     * Find one equipment and its categories, maintenance  
     * Maintenance will also include assignees and uploads  
     * **Equipment must belong to employee or be assigned to employee**
     * @param {number} equipmentId 
     * @param {number} companyId 
     * @param {number} employeeId 
     */
    one: async (equipmentId, companyId, employeeId) => {
        const eqp = await EMP.Equipment.findOne({
            where: {
                equipment_id: equipmentId,
                fk_company_id: companyId
            },
            attributes: ['created_by']
        });

        if (!eqp) throw new E.NotFoundError('equipment');

        // the employee requesting for this equipment created it
        if (eqp.created_by === employeeId) {
            const _includeMaintenance = await getIncludeMaintenance({
                includeAssignees: true,
                includeUploads: true
            });

            const where = {
                equipment_id: equipmentId,
                fk_company_id: companyId
            };

            const include = [$includeAuthor, $includeCategories, _includeMaintenance];

            const equipment = await EMP.Equipment.findOne({ where, include });
            return equipment;
        }

        const [isAssigned, maintenanceIds] = await isAssignedEquipment(equipmentId, employeeId);
        console.log(isAssigned, maintenanceIds);

        // cannot find the row in the m:n table that relates the employee to the equipment
        if (!isAssigned) throw new E.PermissionError('view this equipment');

        const _includeMaintenance = await getIncludeMaintenance({
            includeAssignees: true,
            includeUploads: true
        });

        // already have the maintenance ids
        // dont need to go query db for that agn
        _includeMaintenance.where = { maintenance_id: { [Op.in]: maintenanceIds } };

        const where = {
            equipment_id: equipmentId,
            fk_company_id: companyId
        };

        const include = [$includeAuthor, $includeCategories, _includeMaintenance];

        const equipment = await EMP.Equipment.findOne({ where, include });
        return equipment;
    }
};

// ============================================================

module.exports.editCategory = async (categoryId, companyId, category = {}) => {
    const { name, description } = category;

    // check for duplicate names
    const count = await EMP.Categories.count({ where: { name } });
    if (count) throw new E.DuplicateError('category', 'name');

    const where = { category_id: categoryId, fk_company_id: companyId };

    const [affectedCount] = await EMP.Categories.update({
        name,
        description
    }, { where });

    if (!affectedCount) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.editOneEquipment = async (equipmentId, companyId, createdBy, equipment = {}) => {
    const {
        reference_number,
        register_number,
        serial_number,
        name,
        model,
        location,
        categories = []
    } = equipment;

    const isOwner = await isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.NotFoundError('equipment');

    const where = {
        equipment_id: equipmentId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const transaction = await db.transaction();
    try {
        // sequelize is smart enough to not make a query
        // if all the fields have no value (undef)
        await EMP.Equipment.update({
            reference_number,
            register_number,
            serial_number,
            name,
            model,
            location
        }, { where, transaction });

        // if there are categories to set
        if (categories.length) {
            await EMP.Equipment2Categories.destroy({
                where: { fk_equipment_id: equipmentId },
                transaction
            });

            const categoryInsertions = categories.map((categoryId) => ({
                fk_equipment_id: equipmentId,
                fk_category_id: categoryId
            }));

            await EMP.Equipment2Categories.bulkCreate(categoryInsertions, { transaction });
        }

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.archiveOneEquipment = async (equipmentId, companyId, createdBy) => {
    const where = {
        equipment_id: equipmentId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const [count] = await EMP.Equipment.update({
        archived_at: new Date()
    }, { where });

    if (!count) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.activateOneEquipment = async (equipmentId, companyId, createdBy) => {
    const where = {
        equipment_id: equipmentId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const [count] = await EMP.Equipment.update({
        archived_at: null
    }, { where });

    if (!count) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.deleteCategory = async (categoryId, companyId) => {
    const transaction = await db.transaction();
    try {
        // delete cascade
        // will remove join table rows
        const count = await EMP.Categories.destroy({
            where: {
                category_id: categoryId,
                fk_company_id: companyId
            },
            transaction
        });

        // const [count] = await Promise.all([
        //     EMP.Categories.destroy({
        //         where: {
        //             category_id: categoryId,
        //             fk_company_id: companyId
        //         },
        //         transaction
        //     }),

        //     EMP.Equipment2Categories.destroy({
        //         where: { fk_category_id: categoryId },
        //         transaction
        //     })
        // ]);

        console.log(count);
        if (!count) throw new E.NotFoundError('category');

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

// FIXME incomplete delete
module.exports.deleteOneEquipment = async (equipmentId, companyId, createdBy) => {
    const transaction = await db.transaction();
    try {
        const count = await EMP.Equipment.destroy({
            where: {
                equipment_id: equipmentId,
                fk_company_id: companyId,
                created_by: createdBy
            },
            transaction
        });

        if (!count) throw new E.NotFoundError('equipment');

        // things to consider:
        // equipment2categories
        // many maintenance and their uploads/files, assignees

        // const maintenance = await EMP.Maintenance.findAll({
        //     attributes: ['maintenance_id'],
        //     where: { fk_equipment_id: equipmentId }
        // });

        // const maintenanceIds = maintenance.map((row) => row.maintenace_id);

        await transaction.commit();
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
