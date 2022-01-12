const { BaseError } = require('./BaseError');

class DocumentError extends BaseError {
    constructor() {
        super();
        this.name = 'DocumentError';
        this.message = 'Invalid document';
        this.summary = 'Invalid document';
        this.code = 403;
    }
}

class BlockingError extends DocumentError {
    /**
    * Another [document] is [blocking] and requires action
    */
    constructor(document = 'document', action = 'blocking') {
        super();
        this.name = 'BlockingError';
        this.message = `Another ${document} is ${action} and requires action`;
    }
}

class DuplicateError extends DocumentError {
    /**
    * Another [document] has the same [value]
    */
    constructor(document = 'document', value = 'value') {
        super();
        this.name = 'DuplicateError';
        this.message = `Another ${document} has the same ${value}`;
    }
}

module.exports = {
    DocumentError,
    BlockingError,
    DuplicateError
};
