const { Op } = require('sequelize');

const {
    Employees,
    User: { Accounts, Invitations }
} = require('../schemas/Schemas');

const bcrypt = require('bcryptjs');

const usedInvite = async (token) => {
    const row = await Invitations.findOne({
        where: { token }
    });

    const { email, sent_by, fk_company_id } = row;

    // delete all the invite tokens that has been sent to the person
    // from the same source

    // for platform admins, they dont have company fk
    let where = {
        [Op.and]: [{ email }, { sent_by }]
    };

    // for everyone else
    if (fk_company_id !== null) where = {
        [Op.and]: [{ email }, { sent_by }, { fk_company_id }]
    };

    await Invitations.destroy({ where });
};

// ============================================================

const register = async ({ token, decoded }, data, avatar, admin_level) => {
    let {
        company_id,
        firstname, lastname,
        username, password,
        address = {}
    } = data;

    if (admin_level === 1) company_id = null;

    const hash = bcrypt.hashSync(password, 10);

    const employee = await Employees.create({
        firstname, lastname,
        title: decoded.title,
        email: decoded.email,
        fk_company_id: company_id,
        address,
        admin_level,
        status: 'active'
    }, { include: 'address' });

    try {
        await Accounts.create({
            username,
            fk_employee_id: employee.employee_id,
            status: 'active',
            passwords: [{ password: hash }]
        }, { include: 'passwords' });
    }
    catch (error) {
        employee.destroy({ force: true });
        employee.address.destroy({ force: true });
        throw error;
    }

    await usedInvite(token);

    if (avatar) {
        // TODO avatar file upload
    }

    return employee;
};

// ============================================================

module.exports = {
    register: {
        platformAdmin: (token, data, avatar) => register(token, data, avatar, 1),
        systemAdmin: (token, data, avatar) => register(token, data, avatar, 2),
        secondaryAdmin: (token, data, avatar) => register(token, data, avatar, 3),
        user: (token, data, avatar) => register(token, data, avatar, 0)
    },
    usedInvite
};
