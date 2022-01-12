const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('cloudinary').v2;
const { cloudinary: cloudinaryConfig } = require('../config/config');
const { responses: r } = require('../utils/response');

cloudinary.config({
    cloud_name: cloudinaryConfig.cloudName,
    api_key: cloudinaryConfig.apiKey,
    api_secret: cloudinaryConfig.apiSecret,
    secure: true
});

const storageFactory = (dest) => new CloudinaryStorage({
    cloudinary,
    params: { folder: dest, resource_type: 'raw' }
});

// this is intended to transform the array of objects from multer 
// into an object identified by obj.fieldname
const transformUploads = (req, res, next) => {
    try {
        const uploadObj = {};

        for (const upload of req.files) {
            // check if the object key already exists
            const existingValue = uploadObj[upload.fieldname];

            if (existingValue === undefined) uploadObj[upload.fieldname] = upload;

            else uploadObj[upload.fieldname] = Array.isArray(existingValue)
                // add to the end of the array
                ? [...existingValue, upload]
                // a new array
                : [existingValue, upload];
        }

        req.uploads = uploadObj;
        return next();
    }
    catch (error) {
        return next(error);
    }
};

const uploadAny = ({ to }) => [
    (req, res, next) => {
        const dest = typeof to === 'function' ? to(req, res) : to;
        const storage = storageFactory(dest);
        const upload = multer({ storage }).any();
        return upload(req, res, next);
    },
    transformUploads
];

const transformUpload = (req, res, next) => {
    try {
        req.upload = req.file;
        return next();
    }
    catch (error) {
        return next(error);
    }
};

const uploadOne = ({ field, to }) => [
    (req, res, next) => {
        const dest = typeof to === 'function' ? to(req, res) : to;
        const storage = storageFactory(dest);
        const upload = multer({ storage }).single(field);
        return upload(req, res, next);
    },
    transformUpload
];

// express can recognise that this is an error handling middleware as it has 4 params
// https://expressjs.com/en/guide/using-middleware.html#middleware.error-handling
const destroyUploads = (error, req, res, next) => {
    // single uploads
    if (req.file) {
        cloudinary.uploader.destroy(req.file.filename)
            .catch(console.log);
    }

    // multiple uploads
    if (req.files) {
        const promises = req.files.map((file) => cloudinary.uploader.destroy(
            file.filename, { resource_type: 'raw' }
        ));
        Promise.allSettled(promises)
            .then((allSettled) => {
                const rejections = allSettled.filter((promise) => promise.status === 'rejected');
                if (rejections.length > 0) console.log('there were some rejectied file destroys', rejections);
            });
    }

    // multer errors need to be dealt with
    // but dont send if somehow there was already a response
    const sendMulterError = !res.headersSent && error instanceof multer.MulterError;
    if (sendMulterError) res.status(500).send(r.error500(error));

    // go to the next error handling middleware
    next(error);
};

module.exports = {
    uploadAny,
    uploadOne,
    destroyUploads
};

/*
    WHY THE TRANSFORM
    the previous library used, express-fileupload provides an object at req.files
    for file uploads, and the object consists of keys identified by the form field
    if there is only one item in said field, it will be an object representing an upload
    if there is more than one item in said field, it will be an array of the above

    multer, however, does not do this
    it simply gives an array of objects that represents each upload separately
    (i added fullpath during transformation, whether its necessary, idk)

    the examples below are with temp files on disk storage
    on this branch, it is different as files are uploaded to cloudinary

    before
    [
        {
            fieldname: 'x',
            originalname: 'Clause 1 - 3.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            destination: 'tmp',
            filename: 'c54d10885e7c2f80658f5912c0a6c50b',
            path: 'tmp\\c54d10885e7c2f80658f5912c0a6c50b',
            size: 429121,
            fullpath: 'C:\\Projects\\NewUploadFile\\backend\\tmp\\c54d10885e7c2f80658f5912c0a6c50b'
        }
    ]

    after
    {
        x: {
            fieldname: 'x',
            originalname: 'Clause 1 - 3.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            destination: 'tmp',
            filename: 'c54d10885e7c2f80658f5912c0a6c50b',
            path: 'tmp\\c54d10885e7c2f80658f5912c0a6c50b',
            size: 429121,
            fullpath: 'C:\\Projects\\NewUploadFile\\backend\\tmp\\c54d10885e7c2f80658f5912c0a6c50b'
        }
    }

    express-fileupload
    {
        x: {
            name: 'Clause 1 - 3.pdf',
            data: <Buffer >,
            size: 429121,
            encoding: '7bit',
            tempFilePath: '\\temp\\tmp-4-1632681493534',
            truncated: false,
            mimetype: 'application/pdf',
            md5: 'cb2b3d9270ee918fcb31ecef292662ff',
            mv: [Function: mv]
        }
    }

    on this branch, with multer and transform
    {
        x: {
            fieldname: 'x',
            originalname: 'Clause 1 - 3.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            path: 'https://res.cloudinary.com/cmpkiwidit/raw/upload/v1632907574/test-multer-cloudinary-storage-engine/eel9qjho3k2teallgxgf',
            size: 429121,
            filename: 'test-multer-cloudinary-storage-engine/eel9qjho3k2teallgxgf'
        }
    }
*/
