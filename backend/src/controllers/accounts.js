const {
    findAccountBy,
    requestOtp,
    validateOtp,
    deleteOtps,
    changePassword,
    validatePassword
} = require('../models/accounts');

const { sendEmail, templates } = require('../services/email');

const { ACCOUNT_STATUS } = require('../config/enums');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

module.exports.requestOtp = async (req, res, next) => {
    try {
        const { username } = req.body;

        const account = await findAccountBy.username(username);
        if (!account) throw new E.NotFoundError('account');

        // no point in changing p/w if account is deactivated
        if (account.status === ACCOUNT_STATUS.DEACTIVATED)
            throw new E.AccountStatusError(ACCOUNT_STATUS.DEACTIVATED);

        const { otp, row } = await requestOtp(account.account_id);

        try {
            const name = `${account.employee.firstname} ${account.employee.lastname}`;
            await sendEmail(
                account.employee.email,
                'OTP Request',
                templates.requestOtp(name, otp)
            );
        }
        catch (e) {
            // discard the otp if email fails to send
            row.destroy();
            throw new Error('Email failed to send');
        }

        res.status(200).send(r.success200({ email: account.employee.email }));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.validateOtp = async (req, res, next) => {
    try {
        const { username, otp } = req.body;

        await validateOtp(username, otp);

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.changePasswordWithOtp = async (req, res, next) => {
    try {
        const { username, otp, password } = req.body;

        const otpRow = await validateOtp(username, otp);

        const { employee } = await changePassword(otpRow.fk_account_id, password);

        // delete all otps left for this account
        await deleteOtps(otpRow.fk_account_id);

        const emailContent = templates.passwordChanged(`${employee.firstname} ${employee.lastname}`);

        sendEmail(employee.email, 'Password Changed', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.changePasswordLoggedIn = async (req, res, next) => {
    try {
        const { account_id } = res.locals.account;
        const { old_password, new_password } = req.body;

        const isOldPasswordCorrect = await validatePassword(account_id, old_password);
        if (!isOldPasswordCorrect) throw new E.IncorrectPasswordError();

        const { employee: account } = await changePassword(account_id, new_password);

        const emailContent = templates.passwordChanged(`${account.employee.firstname} ${account.employee.lastname}`);

        sendEmail(account.email, 'Password Changed', emailContent)
            .catch((error) => console.log(`Non-fatal: Failed to send email\n${error}`));

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
