const { findFileById } = require('../models/files.v1');

const c = require('../services/cloudinary.v1');
const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.findFileById = async (req, res, next) => {
    try {
        // decoded JWT token 
        const { fileId } = req.params;
        const { decoded } = res.locals.auth;

        const file = await findFileById(fileId);
        if (!file) throw new E.NotFoundError('file');

        if (file.owner.fk_company_id !== decoded.company_id)
            throw new E.ForeignOrganisationError();

        res.status(200).send(r.success200(file));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.downloadFileById = async (req, res, next) => {
    try {
        // decoded JWT token 
        const { fileId } = req.params;
        const { decoded } = res.locals.auth;

        const file = await findFileById(fileId, true);
        if (!file) throw new E.NotFoundError('file');

        if (file.owner.fk_company_id !== decoded.company_id)
            throw new E.ForeignOrganisationError();

        const inline = `${req.query.inline}`.toLowerCase() === 'true' ? true : false;

        const [readStream, configRes] = await c.downloadFile(file.cloudinary_uri, file.file_name, inline);
        readStream.pipe(res);
        await configRes(res);
        
        return next();
    }
    catch (error) {
        return next(error);
    }
};
