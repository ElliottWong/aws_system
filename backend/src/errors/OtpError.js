const { BaseError } = require('./BaseError');

class OtpError extends BaseError {
    constructor(found, expired) {
        super();
        this.name = 'OtpError';
        this.message = 'OTP is invalid';
        this.summary = 'OTP is invalid';
        this.code = 400;
        this.found = found;
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
                otp_found: this.found,
                otp_expired: this.expired
            }
        };
    }
}

class OtpNotFoundError extends OtpError {
    constructor() {
        super(false);
        this.name = 'OtpNotFoundError';
        this.message = 'OTP not found';
        this.summary = 'Not found';
        this.code = 404;
    }
}

class OtpExpiredError extends OtpError {
    constructor() {
        super('OTP has expired', true, true);
        this.name = 'OtpExpiredError';
    }
}

module.exports = {
    OtpError,
    OtpNotFoundError,
    OtpExpiredError
};
