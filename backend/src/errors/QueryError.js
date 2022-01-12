const { BaseError } = require('./BaseError');

class QueryError extends BaseError {
    constructor() {
        super();
        this.name = 'QueryError';
        this.message = 'Invalid query';
        this.summary = 'Query failed';
        this.code = 400;
    }
}

class NotFoundError extends QueryError {
    /**
     * Cannot find [...]
     */
    constructor(item) {
        super();
        this.name = 'NotFoundError';
        this.message = `Cannot find ${item}`;
        this.summary = 'Not found';
        this.code = 404;
    }
}

module.exports = {
    QueryError,
    NotFoundError
};
