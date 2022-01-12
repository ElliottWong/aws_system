const { BaseError } = require('./BaseError');

class ValidationError extends BaseError {
    constructor() {
        super();
        this.name = 'ValidationError';
        this.message = 'Invalid data';
        this.summary = 'Invalid data';
        this.code = 400;
    }
}

module.exports = { ValidationError };
