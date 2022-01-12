const { BaseError } = require('./BaseError');

class AuthError extends BaseError {
    constructor() {
        super();
        this.name = 'AuthError';
        this.message = 'Auth error';
        this.summary = 'Auth error';
        this.code = 401;
    }
}

class PermissionError extends AuthError {
    /**
     * Employee does not have permission to [manage this document]
     */
    constructor(action = 'manage this document') {
        super();
        this.name = 'PermissionError';
        this.message = `Employee does not have permission to ${action}`;
        this.code = 403;
    }
}

class AdminError extends AuthError {
    /**
     * User cannot [administrate this action]
     */
    constructor(action = 'administrate this action') {
        super();
        this.name = 'AdminError';
        this.message = `User cannot ${action}`;
        this.code = 403;
    }
}

class LoginError extends AuthError {
    constructor() {
        super();
        this.name = 'LoginError';
        this.message = 'Login failed';
    }
}

module.exports = {
    AuthError,
    PermissionError,
    AdminError,
    LoginError
};
