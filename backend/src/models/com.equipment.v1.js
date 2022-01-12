const { Op } = require('sequelize');
const db = require('../config/connection');

const {
    Employees,
    Documents: { EMP }
} = require('../schemas/Schemas');

const E = require('../errors/Errors');

// equipment_type,
// reference_number,
// register_number,
// serial_number,
// model,
// maintenance_type,
// maintenance_frequency_number,
// maintenance_frequency_type,
// location

module.exports.insertEquipmentType = (fk_company_id, { name, description }) => EMP.EquipmentTypes.create({
    fk_company_id, name, description
});

// ============================================================

module.exports.insertOneEquipment = async (fk_company_id, created_by, equipment = {}) => {
    const {
        equipment_type,
        reference_number,
        register_number,
        serial_number,
        model,
        location,
        maintenance_frequency_number,
        maintenance_frequency_type,
        last_service_at
    } = equipment;

    const equipment_type_id = parseInt(equipment_type);
    if (isNaN(equipment_type_id))
        throw new E.ParamTypeError('equipment_type', equipment_type, 1);

    const equipmentTypeCount = await EMP.EquipmentTypes.count({ where: { equipment_type_id } });
    if (equipmentTypeCount !== 1) throw new E.NotFoundError('equipment type');

    return EMP.Equipment.create({
        fk_company_id,
        created_by,
        fk_equipment_type_id: equipment_type_id,
        reference_number,
        register_number,
        serial_number,
        model,
        location,
        maintenance_frequency_number,
        maintenance_frequency_type,
        last_service_at: new Date(last_service_at)
    });
};

// ============================================================

// checks all assigned responsible employees
// make sure they are of the same company
const companyCheck = async (fk_company_id, employeeIds = []) => {
    const promises = employeeIds.map((employee_id) => Employees.count({
        where: { employee_id, fk_company_id }
    }));

    const employees = await Promise.all(promises);

    // we find an employee by their employee id and company id
    // if that does not have any results (ie not 1)
    // the employee does not exist within the company/system
    const invalid = employees.some((count) => count !== 1);
    return !invalid;
};

module.exports.insertOneMaintenance = async (fk_company_id, equipment_id, created_by, { name, description = null, assignees = [] }) => {
    const equipmentCount = await EMP.Equipment.count({
        where: { fk_company_id, equipment_id, created_by }
    });

    // only the employee who created the equipment
    // can also create maintenance for said equipment
    if (equipmentCount !== 1)
        throw new E.PermissionError('create maintenance for an equipment they did not create');

    // either the employee does not exist or does not belong to the company
    const valid = companyCheck(fk_company_id, assignees);
    if (!valid) throw new E.ForeignEmployeeError();

    const transaction = await db.transaction();
    try {
        const insertedMaintenance = await EMP.Maintenance.create({
            fk_equipment_id: equipment_id,
            name, description
        }, { transaction });

        const assignmentInsertions = assignees.map((employee_id) => ({
            fk_equipment_id: equipment_id,
            fk_maintenance_id: insertedMaintenance.maintenance_id,
            fk_employee_id: employee_id
        }));

        await EMP.Assignees.bulkCreate(assignmentInsertions, { transaction });

        await transaction.commit();
        return insertedMaintenance;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.insertMaintenanceUpload = async (fk_company_id, equipment_id, fk_maintenance_id, created_by, serviced_at, file = {}) => {
    // this ensures the maintenance exists,
    // and that the emloyee is indeed assigned to be responsible for the specified maintenance
    const joinRowCount = await EMP.Assignees.count({
        // i think this should be safe enough to avoid any foreign company
        // because during insertion that is guaranteed
        where: {
            fk_equipment_id: equipment_id,
            fk_maintenance_id,
            fk_employee_id: created_by
        }
    });

    if (joinRowCount !== 1) throw new E.NotFoundError('maintenance');

    const transaction = await db.transaction();
    try {
        const serviced_date = new Date(serviced_at);

        const [affectedRowCount, affectedRows] = await EMP.Equipment.update({
            last_service_at: serviced_date
        }, { where: { equipment_id, fk_company_id }, transaction });

        if (affectedRowCount !== 1) throw new E.NotFoundError('equipment');

        // from my custom multer implementation
        const {
            originalname: file_name,
            filename: cloudinary_id,
            path: cloudinary_uri
        } = file;

        const newMaintenanceUpload = await EMP.Uploads.create({
            fk_maintenance_id,
            created_by,
            serviced_at: serviced_date,
            file: {
                file_name,
                cloudinary_id,
                cloudinary_uri,
                created_by
            }
        }, { include: 'file', transaction });

        await transaction.commit();
        return newMaintenanceUpload;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ============================================================

module.exports.findEquipment = {
    // either find all active equipment or all archived equipment
    all: (fk_company_id, includeUploads = false, archivedOnly = false) => {
        const maintenanceIncludes = [{
            association: 'assignees',
            include: {
                association: 'account',
                attributes: ['username']
            },
            // no data from the join table
            through: { attributes: [] }
        }];

        if (includeUploads) {
            maintenanceIncludes.push({
                association: 'uploads',
                include: {
                    association: 'file',
                    attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
                }
            });
        }

        const query = {
            where: { fk_company_id },
            include: {
                association: 'equipment',
                where: {
                    archived_at: archivedOnly ? { [Op.not]: null } : null
                },
                include: [
                    {
                        association: 'author',
                        include: {
                            association: 'account',
                            attributes: ['username']
                        }
                    },
                    {
                        association: 'maintenance',
                        include: maintenanceIncludes
                    }
                ]
            }
        };

        return EMP.EquipmentTypes.findAll(query);
    },

    allResponsible: async (fk_employee_id, includeUploads = false) => {
        const equipmentIds = (await EMP.Assignees.findAll({
            where: { fk_employee_id },
            attributes: ['fk_equipment_id']
        })).map((row) => row.fk_equipment_id);

        if (equipmentIds.length === 0) return [];

        const maintenanceIncludes = [{
            association: 'assignees',
            include: {
                association: 'account',
                attributes: ['username']
            },
            // no data from the join table
            through: { attributes: [] }
        }];

        if (includeUploads) {
            maintenanceIncludes.push({
                association: 'uploads',
                include: {
                    association: 'file',
                    attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
                }
            });
        }

        const query = {
            include: {
                association: 'equipment',
                where: {
                    equipment_id: { [Op.or]: equipmentIds },
                    archived_at: null
                },
                include: [
                    {
                        association: 'author',
                        include: {
                            association: 'account',
                            attributes: ['username']
                        }
                    },
                    {
                        association: 'maintenance',
                        include: maintenanceIncludes
                    }
                ]
            }
        };

        return EMP.EquipmentTypes.findAll(query);
    },

    one: async (fk_company_id, equipment_id, employee_id, includeUploads = false) => {
        // employee can view equipment they are responsible for
        // to ensure that the employee can actually see the equipment
        // as long as he is responsible for at least one maintenance of an equipment
        const joinRowCountPromise = EMP.Assignees.count({
            // i think this should be safe enough to avoid any foreign company
            // because during insertion that is guaranteed
            where: {
                fk_equipment_id: equipment_id,
                fk_employee_id: employee_id
            }
        });

        // employee can view equipment they created
        const equipmentCountPromise = EMP.Equipment.count({
            where: {
                equipment_id,
                created_by: employee_id
            }
        });

        const [joinRowCount, equipmentCount] = await Promise.all([joinRowCountPromise, equipmentCountPromise]);

        // employee is not related to the equipment
        // and the equipment is not created by the employee
        if (joinRowCount === 0 && equipmentCount === 0) throw new E.NotFoundError('equipment');

        const maintenanceIncludes = [{
            association: 'assignees',
            include: {
                association: 'account',
                attributes: ['username']
            },
            // no data from the join table
            through: { attributes: [] }
        }];

        if (includeUploads) {
            maintenanceIncludes.push({
                association: 'uploads',
                include: {
                    association: 'file',
                    attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
                }
            });
        }

        const query = {
            include: {
                association: 'equipment',
                where: { fk_company_id, equipment_id },
                include: [
                    {
                        association: 'author',
                        include: {
                            association: 'account',
                            attributes: ['username']
                        }
                    },
                    {
                        association: 'maintenance',
                        include: maintenanceIncludes
                    }
                ]
            }
        };

        return EMP.EquipmentTypes.findOne(query);
    }
};

// ============================================================

module.exports.editEquipmentType = async (fk_company_id, equipment_type_id, { name, description }) => {
    // const transaction = await db.transaction();

    const [affectedCount, rows] = await EMP.EquipmentTypes.update({
        name, description
    }, { where: { equipment_type_id, fk_company_id } });

    // if (affectedCount !== 1) {
    //     await transaction.rollback();
    //     throw new E.NotFoundError('equipment type');
    // }

    // await transaction.commit();
    return rows[0];
};

// ============================================================

module.exports.editOneEquipment = async (fk_company_id, equipment_id, created_by, { reference_number, register_number, serial_number, model, location, maintenance_frequency_number, maintenance_frequency_type }) => {
    // const transaction = await db.transaction();

    const [affectedCount, rows] = await EMP.Equipment.update({
        reference_number, register_number, serial_number,
        model, location,
        maintenance_frequency_number, maintenance_frequency_type
    }, { where: { equipment_id, fk_company_id, created_by } });

    // if (affectedCount !== 1) {
    //     await transaction.rollback();
    //     throw new E.NotFoundError('equipment');
    // }

    // await transaction.commit();
    return rows[0];
};

// ============================================================

module.exports.archiveOneEquipment = async (fk_company_id, equipment_id, created_by) => {
    // const transaction = await db.transaction();

    const [affectedCount, rows] = await EMP.Equipment.update({
        archived_at: new Date()
    }, { where: { equipment_id, fk_company_id, created_by } });

    // if (affectedCount !== 1) {
    //     await transaction.rollback();
    //     throw new E.NotFoundError('equipment');
    // }

    // await transaction.commit();
    return rows[0];
};

// ============================================================

module.exports.deleteOneEquipment = async (fk_company_id, equipment_id, created_by) => {
    const equipmentCount = await EMP.Equipment.count({
        where: { equipment_id, fk_company_id, created_by }
    });

    if (equipmentCount !== 1) throw new E.NotFoundError('equipment');

    const transaction = await db.transaction();
    try {
        const destroyed = await Promise.all([
            EMP.Equipment.destroy({
                where: { equipment_id, fk_company_id, created_by }, transaction
            }),
            EMP.Maintenance.destroy({
                where: { fk_equipment_id: equipment_id }, transaction
            }),
            EMP.Assignees.destroy({
                where: { fk_equipment_id: equipment_id }, transaction
            }),
            EMP.Uploads.destroy({
                where: { fk_equipment_id: equipment_id }, transaction
            })
        ]);

        await transaction.commit();
        return destroyed.reduce((accumulator, current) => accumulator + current, 0);
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
