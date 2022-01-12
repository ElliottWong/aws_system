const { Sequelize } = require('sequelize');
const { name, user, password, host, port } = require('./config').db;

const logger = require('../utils/logger');
const { WINSTON } = require('../config/enums');

// https://stackoverflow.com/a/53731154
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

// logging for sql commands from sequelize
const logging = (sql, meta) => {
    // log to console
    console.log(sql);

    // log to a debug file
    const joinedMsg = [sql, JSON.stringify(meta, getCircularReplacer())].join('\n');
    logger[WINSTON.FLAGS.DEBUG](joinedMsg);
};

const db = new Sequelize(name, user, password, { host, port, dialect: 'mysql', logging });

module.exports = db;
