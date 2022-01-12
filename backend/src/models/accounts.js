const bcrypt = require('bcryptjs');

const {
    User: { Accounts, Passwords, Otps }
} = require('../schemas/Schemas');

const E = require('../errors/Errors');

module.exports.findAccountBy = {
    id: (account_id, { where, ...others } = {}) => Accounts.findOne({
        ...others,
        where: { ...where, account_id }
    }),

    uuid: (account_uuid, { where, ...others } = {}) => Accounts.findOne({
        ...others,
        where: { ...where, account_uuid }
    }),

    username: (username, { where, ...others } = {}) => Accounts.findOne({
        ...others,
        where: { ...where, username }
    })
};

// ============================================================

module.exports.requestOtp = async (accountId) => {
    // generate a new otp
    const string = '0123456789';
    let otp = '';
    // i want explicit string concat, not that silly string number coercion addition
    for (let i = 0; i < 6; i++) otp = otp.concat(string[Math.floor(Math.random() * string.length)]);

    const row = await Otps.create({
        fk_account_id: accountId,
        code: otp
    });
    return { otp, row };
};

// ============================================================

module.exports.validateOtp = async (username, otp) => {
    const otpRow = await Otps.findOne({
        where: { code: otp },
        include: {
            model: Accounts,
            as: 'account',
            where: { username },
            attributes: ['username']
        }
    });
    // otp not found
    if (!otpRow) throw new E.OtpNotFoundError();

    const now = new Date();
    const issued = new Date(otpRow.created_at);
    const diff = now.getTime() - issued.getTime();

    // less than five minutes
    if (diff < 300000) return otpRow;

    // after five minutes
    await otpRow.destroy();
    throw new E.OtpExpiredError();
};

// ============================================================

module.exports.deleteOtps = (accountId) => Otps.destroy({ where: { fk_account_id: accountId } });

// ============================================================

module.exports.validatePassword = async (account_id, password) => {
    const account = await Accounts.findOne({
        where: { account_id },
        include: {
            model: Passwords,
            as: 'passwords',
            where: { active: true },
            limit: 1
        }
    });
    return bcrypt.compareSync(password, account.passwords[0].password);
};

// ============================================================

module.exports.changePassword = async (accountId, newPassword) => {
    const account = await Accounts.findByPk(accountId, {
        include: ['employee', 'passwords'],
        order: [[Accounts.associations.passwords, 'updated_at', 'ASC']]
    });

    // "ORDER BY updated_at ASC" orders the oldest password first

    // compare all the passwords asynchronously
    const comparisons = await Promise.all(
        account.passwords.map((row) => bcrypt.compare(newPassword, row.password))
    );

    const usedBefore = comparisons.some((compare) => !!compare);
    if (usedBefore) throw new E.RepeatPasswordError();

    // find the current active p/w and set to not active
    await Passwords.update(
        { active: false },
        { where: { fk_account_id: accountId, active: true } }
    );

    const hash = bcrypt.hashSync(newPassword, 10);

    // add in the new password  
    if (account.passwords.length < 5) await Passwords.create({
        fk_account_id: accountId,
        password: hash,
        active: true
    });

    // take the oldest password and update it
    else await account.passwords[0].update({
        password: hash,
        active: true,
        attempts: 0
    });

    if (account.status === 'locked') await account.update({ status: 'active' });

    return account;
};
