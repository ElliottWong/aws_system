const { clientLogin, adminLogin, useRefreshToken } = require('../models/auth');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// PLATFORM CLIENT LOGIN

module.exports.clientLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const [accessToken, refreshToken] = await clientLogin(username, password);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 259200000,
            sameSite: 'none'
        });

        res.status(200).send(r.success200({
            token: accessToken
        }));

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// PLATFORM ADMIN LOGIN

module.exports.adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const [accessToken, refreshToken] = await adminLogin(username, password);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 259200000,
            sameSite: 'none'
        });

        res.status(200).send(r.success200({
            token: accessToken
        }));

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.useRefreshToken = async (req, res, next) => {
    try {
        // get the refresh token from the cookies in the request
        const { refreshToken } = req.signedCookies;
        if (refreshToken === undefined) throw new E.TokenNotFound();

        const [newAccessToken, newRefreshToken] = await useRefreshToken(refreshToken);

        console.log(refreshToken);
        console.log(newRefreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 259200000,
            sameSite: 'none'
        });

        res.status(200).send(r.success200({
            token: newAccessToken
        }));

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// simply clears the refreshToken cookie
module.exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken');
        res.status(200).send(r.success200());

        return next();
    }
    catch (error) {
        return next(error);
    }
};
