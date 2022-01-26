const logger = require('../utils/logger');
const { WINSTON } = require('../config/enums');

// sequelize has its own errors
// that we should check for and NOT send to client 
// as they certainly contain database design
// which can be exploited
// doesnt seem to include model errors
const { BaseError: SequelizeError } = require('sequelize');

const { BaseError, InternalError } = require('../errors/Errors');
const { error500 } = require('../utils/response').responses;

// winston can only read strings or json-like things
// can automatically call the toJSON method on objects (line 38)
const convertErrorForLog = (error) =>
    error.toJSON?.() ??
    error.stack ??
    error.message ??
    error.toString?.() ??
    error;

module.exports = (error, req, res, next) => {
    console.log(error);

    // check if there was already a response
    if (res.headersSent) {
        logger[WINSTON.FLAGS.ERROR](convertErrorForLog(error));
        return;
    }

    // sequelize/db errors
    if (error instanceof SequelizeError) {
        logger[WINSTON.FLAGS.ERROR](convertErrorForLog(error));
        const e = new InternalError();
        return res.status(e.code).send(e.toJSON());
    }

    // custom errors
    if (error instanceof BaseError) {
        logger[WINSTON.FLAGS.INFO](error);
        return res.status(error.code).send(error.toJSON());
    }

    // other errors or fallback
    logger[WINSTON.FLAGS.ERROR](convertErrorForLog(error));
    // probably should not do this
    return res.status(500).send(error500(error));
};
