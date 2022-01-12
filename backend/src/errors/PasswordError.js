const { BaseError } = require('./BaseError');

class PasswordError extends BaseError {
    constructor() {
        super();
        this.name = 'PasswordError';
        this.message = 'Invalid password';
        this.summary = 'Provided password is invalid';
        this.code = 400;
    }
}

class RepeatPasswordError extends PasswordError {
    constructor() {
        super();
        this.name = 'RepeatPasswordError';
        this.message = 'The password has been used before previously';
    }
}

class PasswordStrengthError extends PasswordError {
    constructor() {
        super();
        this.name = 'PasswordStrengthError';
        this.message = 'The password is not strong enough';
    }
}

class IncorrectPasswordError extends PasswordError {
    constructor() {
        super();
        this.name = 'IncorrectPasswordError';
        this.message = 'The password is incorrect';
        this.code = 401;
    }
}

module.exports = {
    PasswordError,
    RepeatPasswordError,
    PasswordStrengthError,
    IncorrectPasswordError
};
