const { BaseError } = require('./BaseError');

class EmailError extends BaseError {
    constructor() {
        super();
        this.name = 'EmailError';
        this.message = 'Email failed to send';
        this.summary = 'Email error';
        this.code = 500;
    }
}

module.exports = { EmailError };
