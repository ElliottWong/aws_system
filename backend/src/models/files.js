// mainly for insertion

const { Files } = require('../schemas/Schemas');

/**
 * To insert a row in the database of a file uploaded to Cloudinary
 * @param {string} originalFileName The original file name from the file upload
 * @param {object} fileMeta The response from the Cloudinary upload
 * @param {number} created_by ID of the employee who uploaded the file
 */
module.exports.insertFileRecord = (originalFileName, fileMeta, created_by) => Files.create({
    file_name: originalFileName,
    cloudinary_id: fileMeta.public_id,
    cloudinary_uri: fileMeta.secure_url,
    created_by
});

/**
 * New file insert
 * @param {number} createdBy Employee Id
 * @param {object} file The file object which multer provides
 * @param {*} transaction Sequelize database transaction
 */
module.exports.insertFile = (createdBy, file = {}, transaction) => Files.create({
    file_name: file.originalname,
    cloudinary_id: file.filename,
    cloudinary_uri: file.path,
    created_by: createdBy
}, { transaction });

// ============================================================

/**
 * Used to create many table rows for when there are many uploads  
 * @param {object[]} insertions File table columns
 */
module.exports.bulkCreateFileRecords = (insertions) => Files.bulkCreate(insertions);

// ============================================================

/**
 * Insert many files that a single employee uploads
 * @param {number} createdBy Employee Id
 * @param {object[]} files An array of file object which multer provides
 * @param {*} transaction Sequelize database transaction
 */
module.exports.insertFiles = (createdBy, files = [], transaction) => {
    const rows = files.map((file) => ({
        file_name: file.originalname,
        cloudinary_id: file.filename,
        cloudinary_uri: file.path,
        created_by: createdBy
    }));

    return Files.bulkCreate(rows, { transaction });
};

// ============================================================

module.exports.findFileById = (file_id, includeCloudinary = false) => {
    const search = { where: { file_id }, include: 'owner' };
    // dont want the cloudinary public id and uri
    if (!includeCloudinary) search.attributes = {
        exclude: ['cloudinary_id', 'cloudinary_uri']
    };
    return Files.findOne(search);
};
