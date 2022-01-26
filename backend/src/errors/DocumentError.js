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

class DocumentStatusError extends DocumentError {
    /**
     * The [document] is [not approved]
     */
    constructor(document = 'document', status = 'not approved') {
        super();
        this.name = 'DocumentStatusError';
        this.message = `The ${document} is ${status}`;
    }
}

class DocumentValueError extends DocumentError {
    /**
     * The [document] already has [been completed]
     */
    constructor(document = 'document', action = 'been completed') {
        super();
        this.name = 'DocumentValueError';
        this.message = `The ${document} already has ${action}`;
    }
}

module.exports = {
    DocumentError,
    BlockingError,
    DuplicateError,
    DocumentStatusError,
    DocumentValueError
};
