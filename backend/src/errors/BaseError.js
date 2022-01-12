// extending Error and making customer errors
// ive always had this idea to do this but its a bit late now
// ill leave this in, perhaps to be picked up again in the future

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
