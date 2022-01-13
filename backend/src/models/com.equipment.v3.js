// yes, most of these are overdone

const { Sequelize, Op } = require('sequelize');
const db = require('../config/connection');

const {
    Documents: { EMP }
} = require('../schemas/Schemas');

const E = require('../errors/Errors');

module.exports.insertCategory = async (companyId, category = {}) => {
    const {
        name,
        description
    } = category;

    // check whether the company already 
    // has an existing category with the same name

    const count = await EMP.Categories.count({
        where: { name } // where clauses are case insensitive
    });

    console.log(count);

    // this check is case insensitive
    if (count > 0) throw new E.DuplicateError('category', 'name');

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

        if (categories.length < 1) {
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

    return assignedEquipment.map((row) => row.fk_equipment_id);
};

const isAssignedEquipment = async (equipmentId, employeeId) => {
    const rows = await EMP.MaintenanceAssignees.findAll({
        where: {
            fk_equipment_id: equipmentId,
            fk_employee_id: employeeId
        },
        attributes: ['fk_maintenance_id']
    });

    const isAssigned = rows.length > 0;
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

    return count === 1;
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

    join.where = { maintenance_id: { [Op.or]: assignedMaintenanceIds } };
    return join;
};

// to get all the equipment a maintenance has
// optionally if given the employee,
// only get those equipment with maintenance that the employee is assigned
const getIncludeEquipment = async function ({
    employeeId = null,
    includeMaintenance = false,
    includeMaintenanceAssignees = false,
    includeMaintenanceUploads = false,
    archivedOnly = false
}) {
    // TODO check whether the include where clause will actually also filter out 
    // equipment which are not assigned to a given employee
    // -> yes

    const join = {
        association: 'equipment',
        where: { archived_at: archivedOnly ? { [Op.not]: null } : null },
        include: [$includeAuthor],
        through: { attributes: [] }
    };

    if (includeMaintenance) {
        const maintenanceInclude = await getIncludeMaintenance({
            employeeId,
            includeAssignees: includeMaintenanceAssignees,
            includeUploads: includeMaintenanceUploads
        });
        join.include.push(maintenanceInclude);
    }

    return join;
};

module.exports.helpers = {
    includes: {
        author: $includeAuthor,
        categories: $includeCategories,
        maintenanceAssignees: $includeMaintenanceAssignees,
        maintenanceUploads: $includeMaintenanceUploads
    },
    getIncludeEquipment,
    getIncludeMaintenance,
    isEquipmentOwner,
    isAssignedEquipment,
    getAssignedEquipmentIds,
    getAssignedMaintenance
};

// ============================================================

module.exports.findCategories = {
    all: function ({
        companyId: fk_company_id
        // includeEquipment = false,
        // includeMaintenance = false,
        // includeMaintenanceAssignees = false,
        // includeMaintenanceUploads = false,
        // archivedOnly = false // archived equipment
    }) {
        const where = { fk_company_id };
        // const include = [];

        // if (includeEquipment) {
        //     const _includeEquipment = await getIncludeEquipment({
        //         includeMaintenance,
        //         includeMaintenanceAssignees,
        //         includeMaintenanceUploads,
        //         archivedOnly
        //     });
        //     include.push(_includeEquipment);
        // }

        return EMP.Categories.findAll({ where });
    },

    // allResponsible: async function ({
    //     employeeId,
    //     includeEquipment = true,
    //     includeMaintenance = false,
    //     includeMaintenanceAssignees = false,
    //     includeMaintenanceUploads = false,
    //     archivedOnly = false
    // }) {
    //     const include = [];

    //     if (includeEquipment) {
    //         const _includeEquipment = await getIncludeEquipment({
    //             employeeId,
    //             includeMaintenance,
    //             includeMaintenanceAssignees,
    //             includeMaintenanceUploads,
    //             archivedOnly
    //         });
    //         include.push(_includeEquipment);
    //     }

    //     return EMP.Categories.findAll({ include });
    // },

    // FIXME will not work if category has no equipment
    one: async function ({
        categoryId: category_id,
        companyId: fk_company_id,
        employeeId = null,
        includeEquipment = true,
        includeMaintenance = false,
        includeMaintenanceAssignees = false,
        includeMaintenanceUploads = false,
        archivedOnly = false
    }) {
        const where = { category_id, fk_company_id };
        const include = [];

        if (includeEquipment) {
            const _includeEquipment = await getIncludeEquipment({
                employeeId,
                includeMaintenance,
                includeMaintenanceAssignees,
                includeMaintenanceUploads,
                archivedOnly
            });
            include.push(_includeEquipment);
        }

        console.dir({ where, include }, { depth: null });

        return EMP.Categories.findOne({ where, include });
    }
};

// ============================================================

module.exports.findEquipment = {
    all: async function ({
        companyId: fk_company_id,
        includeMaintenance = false,
        includeMaintenanceAssignees = false,
        includeMaintenanceUploads = false,
        archivedOnly = false
    }) {
        const where = {
            fk_company_id,
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = [$includeAuthor, $includeCategories];

        if (includeMaintenance) {
            const _includeMaintenance = await getIncludeMaintenance({
                includeAssignees: includeMaintenanceAssignees,
                includeUploads: includeMaintenanceUploads
            });
            include.push(_includeMaintenance);
        }

        return EMP.Equipment.findAll({ where, include });
    },

    allResponsible: async function ({
        employeeId,
        includeMaintenance = false,
        includeMaintenanceAssignees = false,
        includeMaintenanceUploads = false,
        archivedOnly = false
    }) {
        const assignedEquipmentIds = await getAssignedEquipmentIds(employeeId);

        // employee has no assigned equipment
        if (assignedEquipmentIds.length < 1) return [];

        const where = {
            // dont need this when maintenance will also be only those that are assigned
            // equipment_id: { [Op.or]: assignedEquipmentIds },
            archived_at: archivedOnly ? { [Op.not]: null } : null
        };

        const include = [$includeAuthor, $includeCategories];

        if (includeMaintenance) {
            const _includeMaintenance = await getIncludeMaintenance({
                employeeId,
                includeAssignees: includeMaintenanceAssignees,
                includeUploads: includeMaintenanceUploads
            });
            include.push(_includeMaintenance);
        }

        return EMP.Equipment.findAll({ where, include });
    },

    one: async function ({
        equipmentId: equipment_id,
        companyId: fk_company_id,
        employeeId,
        includeMaintenance = false,
        includeMaintenanceAssignees = false,
        includeMaintenanceUploads = false
    }) {
        const eqp = await EMP.Equipment.findOne({
            where: { equipment_id, fk_company_id },
            attributes: ['created_by']
        });

        if (!eqp) throw new E.NotFoundError('equipment');

        // the employee requesting for this equipment created it
        if (eqp.created_by === employeeId) {
            const where = { equipment_id, fk_company_id };
            const include = [$includeAuthor, $includeCategories];

            if (includeMaintenance) {
                const _includeMaintenance = await getIncludeMaintenance({
                    includeAssignees: includeMaintenanceAssignees,
                    includeUploads: includeMaintenanceUploads
                });
                include.push(_includeMaintenance);
            }

            const equipment = await EMP.Equipment.findOne({ where, include });

            return equipment;
        }
        else {
            const [isAssigned, maintenanceIds] = await isAssignedEquipment(equipment_id, employeeId);
            console.log(isAssigned, maintenanceIds);

            // cannot find the row in the m:n table that relates the employee to the equipment
            if (!isAssigned) throw new E.PermissionError('view this equipment');

            const where = { equipment_id, fk_company_id };
            const include = [$includeAuthor, $includeCategories];

            if (includeMaintenance) {
                const _includeMaintenance = await getIncludeMaintenance({
                    includeAssignees: includeMaintenanceAssignees,
                    includeUploads: includeMaintenanceUploads
                });

                // already have the maintenance ids
                // dont need to go query db for that agn
                _includeMaintenance.where = {
                    maintenance_id: { [Op.or]: maintenanceIds }
                };

                include.push(_includeMaintenance);
            }

            const equipment = await EMP.Equipment.findOne({ where, include });

            return equipment;
        }
    }
};

// ============================================================

module.exports.editCategory = async (categoryId, companyId, category = {}) => {
    const {
        name,
        description
    } = category;

    const where = {
        category_id: categoryId,
        fk_company_id: companyId
    };

    const [affectedCount] = await EMP.Categories.update({
        name,
        description
    }, { where });

    if (affectedCount === 0) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.editOneEquipment = async (equipmentId, companyId, createdBy, equipment = {}) => {
    const {
        reference_number,
        register_number,
        serial_number,
        model,
        location,
        categories = []
    } = equipment;

    const where = {
        equipment_id: equipmentId,
        fk_company_id: companyId,
        created_by: createdBy
    };

    const isOwner = await isEquipmentOwner(equipmentId, companyId, createdBy);
    if (!isOwner) throw new E.NotFoundError('equipment');

    const transaction = await db.transaction();
    try {
        // sequelize is smart enough to not make a query
        // if all the fields have no value (undef)
        await EMP.Equipment.update({
            reference_number,
            register_number,
            serial_number,
            model,
            location
        }, { where });

        // if there are categories to set
        if (categories.length > 0) {
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

    if (count === 0) throw new E.NotFoundError('equipment');
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

    if (count === 0) throw new E.NotFoundError('equipment');
};

// ============================================================

module.exports.deleteCategory = async (categoryId, companyId) => {
    const transaction = await db.transaction();
    try {
        const count = await EMP.Categories.destroy({
            where: {
                category_id: categoryId,
                fk_company_id: companyId
            },
            transaction
        });

        const isDestroyed = count > 0;

        if (!isDestroyed) throw new E.NotFoundError('equipment');

        await EMP.Equipment2Categories.destroy({
            where: { fk_category_id: categoryId },
            transaction
        });

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

        const isDestroyed = count > 0;

        if (!isDestroyed) throw new E.NotFoundError('equipment');

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
