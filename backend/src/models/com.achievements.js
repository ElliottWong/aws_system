const { Op } = require('sequelize');

const {
    Files,
    Employees,
    User: { Accounts },
    Documents: { OAP }
} = require('../schemas/Schemas');

const { DOCUMENT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const { bulkCreateFileRecords } = require('./files');

// CREATE

/**
 * Inserts an OAP  
 * Returns a model instance of the new OAP and the deleted file ids
 * @param {object} data OAP form and items information
 * @param {object} uploadedFiles `req.files`
 */
module.exports.insertAchievement = async (data = {}, uploadedFiles = {}) => {
    const {
        companyId: fk_company_id,
        title,
        created_by,
        approved_by,
        achievements
    } = data;

    const parentForm = await OAP.Forms.create({
        fk_company_id, title, created_by, approved_by,
        status: DOCUMENT_STATUS.PENDING
    });
    const { achievement_id } = parentForm;

    const newFileKeys = [];

    // i need to do this first before all else because regardless of whatever happens below
    // i still need to clean up the temp files
    // go thru every achievement item and find all the newly uploaded files in each item
    achievements.forEach((achievement) => {
        const { files = [] } = achievement;
        // trick with OR where if LHS is falsy, it will evaluate RHS
        files.forEach((file) => !file.new || newFileKeys.push(file.key));
    });

    try {
        /* NO LONGER with Multer-Cloudinary Storage Engine
        // find the uploaded files in req.files using the array of keys
        // and upload to cloudinary
        // then transform into [meta, upload] so i can bulk create file records in db
        const uploadToCloudinaryPromises = newFileKeys.map(key => {
            const tempFile = uploadedFiles[key];
            return c.uploadFile(tempFile.fullpath, c.formDocumentsFolderPath(fk_company_id, "m06_02"))
                .then(upload => {
                    const meta = { file_name: tempFile.originalname, created_by };
                    return [meta, upload];
                });
        });
        */

        const insertFileRows = newFileKeys.map((key) => {
            const file = uploadedFiles[key];
            const row = {
                file_name: file.originalname,
                cloudinary_id: file.filename,
                cloudinary_uri: file.path,
                created_by
            };
            return row;
        });

        const rows = await bulkCreateFileRecords(insertFileRows);

        const uploaded = {};
        rows.forEach((row, i) => {
            // the index should still all match
            uploaded[newFileKeys[i]] = row;
        });

        var deletedFileIds = [];

        const insertions = achievements.map((achievementItem) => {
            const {
                function: fn,
                quality_objective,
                personel_responsible,
                data_collection,
                data_analysis,
                display_order,
                parent_item_id,
                files = []
            } = achievementItem;

            const insertion = {
                fk_achievement_id: achievement_id,
                function: fn,
                quality_objective,
                personel_responsible,
                data_collection,
                data_analysis,
                display_order,
                parent_item_id,
                data: []
            };

            files.forEach((file) => {
                if (file.new === true) {
                    const { file_id: fk_file_id } = uploaded[file.key];
                    insertion.data.push({ fk_file_id, file_name: file.name });
                }
                else if (file.deleted === true) {
                    deletedFileIds.push(file.file_id);
                }
                else {
                    const { file_id: fk_file_id, name: file_name } = file;
                    insertion.data.push({ fk_file_id, file_name });
                }
            });

            return insertion;
        });

        await OAP.Items.bulkCreate(insertions, { include: 'data' });
    }
    catch (error) {
        parentForm.destroy({ force: true });
        throw error;
    }

    return [parentForm, deletedFileIds];
};

// ============================================================

// READ

module.exports.findBlockingAchievement = (fk_company_id) => OAP.Forms.findOne({
    where: {
        fk_company_id,
        status: { [Op.or]: [DOCUMENT_STATUS.PENDING, DOCUMENT_STATUS.REJECTED] }
    }
});

// ============================================================

module.exports.findAchievements = ({ where = {}, includeItems = true, ...others } = {}) => {
    // provide operators so controller does not need to import it
    const w = typeof where === 'function' ? where(Op) : where;

    // construct the join queries
    const join = {
        include: [{
            model: Employees,
            as: 'author',
            include: {
                model: Accounts,
                as: 'account',
                attributes: ['username']
            }
        }, {
            model: Employees,
            as: 'approver',
            include: {
                model: Accounts,
                as: 'account',
                attributes: ['username']
            }
        }]
    };

    if (includeItems) {
        join.include.push({
            model: OAP.Items,
            as: 'items',
            include: [{
                model: OAP.TrackingData,
                as: 'data',
                include: {
                    model: Files,
                    as: 'file',
                    attributes: {
                        exclude: ['cloudinary_id', 'cloudinary_uri']
                    }
                }
            }, 'role']
        });
        join.order = [[OAP.Forms.associations.items, 'display_order', 'ASC']];
    }

    return OAP.Forms.findAll({ where: w, ...join, ...others });
};

// ============================================================

// DELETE

/**
 * Deletes an OAP completely
 * @param {number} fk_company_id 
 * @param {number} achievement_id 
 * @param {boolean} force To hard delete a row
 * @returns {Promise<number>} Rows affected
 */
module.exports.deleteAchievement = async (fk_company_id, achievement_id, force = false) => {
    const toBeDeleted = await OAP.Forms.findOne({
        where: {
            fk_company_id, achievement_id,
            status: { [Op.or]: [DOCUMENT_STATUS.ARCHIVED, DOCUMENT_STATUS.PENDING] }
        },
        include: 'items'
    });
    if (!toBeDeleted) throw new E.NotFoundError('OAP');

    const destroyForm = toBeDeleted.destroy({ force });

    const destroyItems = OAP.Items.destroy({
        where: { fk_achievement_id: achievement_id }, force
    });

    const itemIds = toBeDeleted.items.map((item) => item.achievement_item_id);

    const destroyTrackingData = OAP.TrackingData.destroy({
        where: { fk_achievement_item_id: { [Op.or]: itemIds } }, force
    });

    const destroyed = await Promise.all([
        destroyForm,
        destroyItems,
        destroyTrackingData
    ]);

    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
