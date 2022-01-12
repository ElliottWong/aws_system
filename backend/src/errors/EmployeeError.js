const { BaseError } = require('./BaseError');

class EmployeeError extends BaseError {
    constructor(message) {
        super();
        this.name = 'EmployeeError';
        this.message = message ?? 'Employee cannot perform requested feature';
        this.summary = 'Forbidden action';
        this.code = 403;
    }
}

module.exports = { EmployeeError };
