const { MODULE } = require('../config/enums');
const { findRights } = require('../models/com.roles');

const { parseBoolean } = require('../utils/request');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.insertOneMaintenance = async (req, res, next) => {
    try {

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.insertMaintenanceUpload = async (req, res, next) => {
    try {

        return next();
    }
    catch (error) {
        return next(error);
    }
};
