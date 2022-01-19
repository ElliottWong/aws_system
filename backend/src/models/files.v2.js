// used for creating rows in the files table
// takes the uploaded file object from multer

const { Files } = require('../schemas/Schemas');

const { deleteFile } = require('../services/cloudinary.v1');

// insert a row into file table
// with an optional transaction
module.exports.insertFile = (createdBy, file = {}, transaction) => Files.create({
    file_name: file.originalname,
    cloudinary_id: file.filename,
    cloudinary_uri: file.path,
    created_by: createdBy
}, { transaction });

// ============================================================

// insert many rows into file table
// with an optional transaction
// same created by
module.exports.insertFiles = (createdBy, files = [], transaction) => {
    const insertions = files.map((file) => ({
        file_name: file.originalname,
        cloudinary_id: file.filename,
        cloudinary_uri: file.path,
        created_by: createdBy
    }));

    return Files.bulkCreate(insertions, { transaction });
};

// ============================================================

module.exports.findFileById = (fileId, includeCloudinary = false) => {
    const search = {
        where: { file_id: fileId },
        include: 'owner'
    };

    // dont want the cloudinary public id and uri
    if (!includeCloudinary) search.attributes = {
        exclude: ['cloudinary_id', 'cloudinary_uri']
    };

    return Files.findOne(search);
};

// ============================================================

// only deletes a file from database
// but not from cloudinary
// no transactions
module.exports.deleteFile = (fileId) => Files.destroy({
    where: { file_id: fileId }
});

// ============================================================

// delete file from cloudinary and database
// no transactions
module.exports.deleteFileEntirely = async (fileId) => {
    const file = await Files.findOne({
        where: { file_id: fileId }
    });

    // should always be deleted in this order
    // so that system never lose track of files in cloudinary
    await deleteFile(file.cloudinary_id);
    await file.destroy();
};
