// https://javascript.info/custom-errors
// https://stackoverflow.com/a/32750746

class BaseError extends Error {
    constructor() {
        super();
        this.name = 'BaseError';
        this.message = 'Client error';
        this.summary = 'Client error';
        this.code = 400;
    }

    toJSON() {
        return {
            OK: false,
            status: this.code,
            message: this.summary,
            error: {
                name: this.name,
                message: this.message
            }
        };
    }
}

module.exports = { BaseError };
