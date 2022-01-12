const winston = require('winston');
const path = require('path');

const { enumValues, WINSTON } = require('../config/enums');
const levels = enumValues(WINSTON.FLAGS);

// format for all file transports
const format = winston.format.combine(
    winston.format.json(),
    winston.format.timestamp()
);

/* // creates a file transport for each logging level
const transports = Object.values(WINSTON.FLAGS).map((level) => {
    return new winston.transports.File({
        level,
        format,
        filename: `${level}.log`,
        dirname: './logs'
    });
});

const logger = winston.createLogger({
    // the lowest level it should log
    // i think its used as default for properties that dont specify their own level
    // for dev ill put the very lowest level
    level: Object.values(WINSTON.FLAGS).at(-1),
    // all the logging levels
    levels: WINSTON.LEVELS,
    transports
});

module.exports = logger; */

/*
    its a feature of winston with no opt out that logs "cascade"

    google defines cascade as:
    a small waterfall, typically one of several that fall in stages down a steep rocky slope

    thus, logs of the "error" level will be not only in error.log, but also all other levels below "error"

    winston will create methods on the logger with the log levels provided
    use the FLAGS property because LEVELS is for creating the logger
    inspired by discord.js (but v13 is hell)
*/

// logger[WINSTON.FLAGS.ERROR]('privet');
// logger[WINSTON.FLAGS.INFO]('hello');
// logger[WINSTON.FLAGS.ACCESS]('hi');

const dirname = path.resolve(__dirname, '..', '..', 'logs');

const createLogger = (level) => {
    const fileTransport = new winston.transports.File({
        level,
        format,
        filename: `${level}.log`,
        dirname
    });

    const logger = winston.createLogger({
        level,
        levels: { [level]: 0 },
        transports: [fileTransport]
    });
    
    return (...args) => logger.log(level, ...args);
};

const loggers = {};

levels.forEach((level) => {
    loggers[level] = createLogger(level);
});

module.exports = loggers;
