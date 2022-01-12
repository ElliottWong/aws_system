const { BaseError } = require('./BaseError');

class OrganisationError extends BaseError {
    constructor(found, status) {
        super();
        this.name = 'OrganisationError';
        this.message = 'Forbidden organisation access';
        this.summary = 'Invalid organisation';
        this.code = 403;
        this.found = found;
        this.status = status;
    }

    toJSON() {
        return {
            OK: false,
            status: this.code,
            message: this.summary,
            error: {
                name: this.name,
                message: this.message,
                // this two may be undefined, 
                // so these properties will disappear when json'd
                organisation_found: this.found,
                organisation_status: this.status
            }
        };
    }
}

class ForeignOrganisationError extends OrganisationError {
    constructor() {
        super();
        this.name = 'ForeignOrganisationError';
        this.message = 'Breached a foreign organisation';
    }
}

class ForeignEmployeeError extends OrganisationError {
    constructor() {
        super();
        this.name = 'ForeignEmployeeError';
        this.message = 'Invalid assignment of a foreign employee';
    }
}

class OrganisationStatusError extends OrganisationError {
    /**
     * The organisation is currently [...]
     */
    constructor(status) {
        super(true, status);
        this.name = 'OrganisationStatusError';
        this.message = `The organisation is currently ${status}`;
    }
}

class OrganisationNotFoundError extends OrganisationError {
    constructor() {
        super(false);
        this.name = 'OrganisationNotFoundError';
        this.message = 'Organisation does not exist';
        this.summary = 'Not found';
        this.code = 404;
    }
}

module.exports = {
    OrganisationError,
    ForeignOrganisationError,
    ForeignEmployeeError,
    OrganisationStatusError,
    OrganisationNotFoundError
};
