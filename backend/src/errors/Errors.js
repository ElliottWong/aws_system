const AccountErrors = require('./AccountError');
const AuthErrors = require('./AuthError');
const BaseError = require('./BaseError');
const DocumentErrors = require('./DocumentError');
const EmployeeErrors = require('./EmployeeError');
const InternalError = require('./InternalError');
const OrganisationErrors = require('./OrganisationError');
const OtpErrors = require('./OtpError');
const ParamErrors = require('./ParamError');
const PasswordErrors = require('./PasswordError');
const QueryErrors = require('./QueryError');
const TokenErrors = require('./TokenError');

module.exports = {
    ...AccountErrors,
    ...AuthErrors,
    ...BaseError,
    ...DocumentErrors,
    ...EmployeeErrors,
    ...InternalError,
    ...OrganisationErrors,
    ...OtpErrors,
    ...ParamErrors,
    ...PasswordErrors,
    ...QueryErrors,
    ...TokenErrors
};
