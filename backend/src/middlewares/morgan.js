const morgan = require('morgan');
const logger = require('../utils/logger');
const { WINSTON } = require('../config/enums');

// morgan outputs can be passed to winston
// https://coralogix.com/blog/complete-winston-logger-guide-with-hands-on-examples/

module.exports = morgan('combined', {
    stream: {
        write: (str) => {
            console.log(str);
            logger[WINSTON.FLAGS.ACCESS](str);
        }
    }
});
