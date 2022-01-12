const { BaseError } = require('./BaseError');

class TokenError extends BaseError {
    constructor(broken, expired) {
        super();
        this.name = 'TokenError';
        this.message = 'JWT is invalid';
        this.summary = 'Invalid JWT';
        this.code = 401;
        this.broken = broken;
        this.expired = expired;
    }

    toJSON() {
        return {
            OK: false,
            status: this.code,
            message: this.summary,
            error: {
                name: this.name,
                message: this.message,
                token_broken: this.broken,
                token_expired: this.expired
            }
        };
    }
}

class TokenBrokenError extends TokenError {
    constructor() {
        super(true);
        this.name = 'TokenBrokenError';
        this.message = 'The token is broken';
    }
}

class TokenExpiredError extends TokenError {
    constructor() {
        super(false, true);
        this.name = 'TokenExpiredError';
        this.message = 'The token has expired';
    }
}

class TokenNotFound extends TokenError {
    constructor() {
        super();
        this.name = 'TokenNotFound';
        this.message = 'The token is missing';
    }
}

module.exports = {
    TokenError,
    TokenBrokenError,
    TokenExpiredError,
    TokenNotFound
};
