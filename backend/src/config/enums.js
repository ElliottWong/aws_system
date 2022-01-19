const enumValues = (enumeration) => Object.values(enumeration);

const testEnum = (enumeration, value) => enumValues(enumeration).includes(value.toLowerCase());

const testModule = (value) => /^m[0-9]{2}_[0-9]{2}[a-z]?$/.test(value);

module.exports = {
    // utility functions
    enumValues, testEnum, testModule,
    MODULE: {
        SCOPES: 'm01_01',
        NORMATIVE_REFERENCES: 'm02_01',
        TERMS_AND_DEFINITIONS: 'm03_01',
        SWOT: 'm04_01',
        INTERESTED_PARTIES: 'm04_02',
        QMS_SCOPE: 'm04_03',
        POLICIES: 'm05_02',
        ORGANISATION_CHARTS: 'm05_03',
        RO: 'm06_01', // risks and opportunities
        OAP: 'm06_02', // objective achievement program
        EMP: 'm07_01', // equipment maintenance program
        PLC: 'm07_02', // permits licences certs
        TRAINING_REQUESTS: 'm07_03a',
        TRAINING_EVALUATION: 'm07_03c',
        INDUCTION: 'm07_03d'
    },
    DOCUMENT_STATUS: {
        ACTIVE: 'active',
        PENDING: 'pending',
        REJECTED: 'rejected',
        ARCHIVED: 'archived'
    },
    TRAINING_STATUS: {
        APPROVED: 'approved',
        PENDING: 'pending',
        REJECTED: 'rejected',
        CANCELLED: 'cancelled'
    },
    ACCOUNT_STATUS: {
        ACTIVE: 'active',
        LOCKED: 'locked',
        DEACTIVATED: 'deactivated'
    },
    ORGANISATION_STATUS: {
        ACTIVE: 'active',
        SUSPENDED: 'suspended'
    },
    ADMIN_LEVEL: {
        USER: 0,
        EISO: 1,
        SUPER: 2
    },
    EVALUATION_QUESTION_TYPE: {
        RATING: 'rating', // rate 1 to 5
        OPEN: 'open', // open ended question
        LIST: 'list', // many open ended answers
        BOOLEAN: 'bool', // yes or no
        MCQ: 'mcq'
    },
    INDUCTION_FILE_TYPE: {
        UPLOAD: 'upload',
        EXTERNAL: 'external'
    },
    // https://github.com/expressjs/multer/blob/master/lib/multer-error.js
    MULTER_ERROR: {
        LIMIT_PART_COUNT: 'Too many parts',
        LIMIT_FILE_SIZE: 'File too large',
        LIMIT_FILE_COUNT: 'Too many files',
        LIMIT_FIELD_KEY: 'Field name too long',
        LIMIT_FIELD_VALUE: 'Field value too long',
        LIMIT_FIELD_COUNT: 'Too many fields',
        LIMIT_UNEXPECTED_FILE: 'Unexpected field'
    },
    WINSTON: {
        LEVELS: {
            error: 0,
            warn: 1,
            info: 2,
            access: 3,
            debug: 4
        },
        FLAGS: {
            ERROR: 'error',
            WARN: 'warn',
            INFO: 'info',
            ACCESS: 'access',
            DEBUG: 'debug'
        }
    }
};
