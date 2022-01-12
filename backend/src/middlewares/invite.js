// this middleware is for validating an invite token

const jwt = require('jsonwebtoken');

const { jwt: { secret: jwtSecret } } = require('../config/config');
const E = require('../errors/Errors');
const { responses: r } = require('../utils/response');

module.exports.validateInviteToken = (req, res, next) => {
    try {
        const token = req.params.inviteToken;
        if (!token) return res.status(401).json({ message: 'No invitation token', broken: null, expired: null });

        try {
            var decode = jwt.verify(token, jwtSecret);
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) throw new E.TokenExpiredError();
            if (error instanceof jwt.JsonWebTokenError) throw new E.TokenBrokenError();
            throw error;
        }

        // store the auth in the request so that the callback chain can access this data if necessary
        // https://expressjs.com/en/api.html#res.locals
        res.locals.invite = { token, decoded: decode };

        return next();
    }
    catch (error) {
        // custom errors
        if (error instanceof E.BaseError) return res
            .status(error.code)
            .send(error.toJSON());
        // other errors
        console.log(error);
        return res.status(500).send(r.error500(error));
    }
};
