// this middleware is for validating a login token

const jwt = require('jsonwebtoken');
const { secret: jwtSecret } = require('../config/config').jwt;

const { findAccountBy } = require('../models/accounts');

const E = require('../errors/Errors');

module.exports.isLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new E.TokenNotFound();

        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) throw new E.TokenExpiredError();
            if (error instanceof jwt.JsonWebTokenError) throw new E.TokenBrokenError();
            throw error;
        }

        const account = await findAccountBy.uuid(decoded.account_uuid);

        if (account === null) throw new E.AccountNotFoundError();

        // store the auth in the request so that the callback chain can access this data if necessary
        // https://expressjs.com/en/api.html#res.locals
        res.locals = {
            auth: { token, decoded },
            account: account.toJSON()
        };

        return next();
    }
    catch (error) {
        return next(error);
    }
};
