const jwt = require('jsonwebtoken');

const {
    User,
    Employees,
    Companies
} = require('../schemas/Schemas');

const { register } = require('../models/invitations');

const {
    frontend,
    jwt: { secret: jwtSecret }
} = require('../config/config');

const { ADMIN_LEVEL } = require('../config/enums');

const { sendEmail, templates } = require('../services/email');

const validators = require('../middlewares/validator');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

const jumpContentTemplates = {
    0: templates.inviteUser,
    1: templates.invitePlatformAdmin,
    2: templates.inviteSystemAdmin,
    3: templates.inviteUser
};

const jumpRegister = {
    0: register.user,
    1: register.platformAdmin,
    2: register.systemAdmin,
    3: register.secondaryAdmin
};

/**
 * Provide the Express request, response and next, with admin_level
 * ```js
 * (req, res, next) => createInvite(req, res, next, 0)
 * ```
 * @param {*} req Express request
 * @param {*} res Express respond
 * @param {*} next Express next
 * @param {number} new_admin_level [0, 1, 2, 3] user, platform admin, system admin, secondary admin
 * @returns {Promise<void>} Nothing
 */
module.exports.createInvite = async (req, res, next, new_admin_level) => {
    try {
        const creator_admin_level = res.locals.auth.decoded.admin_level;
        const created_by = res.locals.account.fk_employee_id;

        const { companyId } = req.params;

        // as a user...
        // cannot invite anyone
        if (creator_admin_level === ADMIN_LEVEL.USER)
            throw new E.AdminError('issue invites');

        // as a platform admin...
        // can invite other platform admins (1)
        // can invite the company's first system admin (2)
        if (creator_admin_level === ADMIN_LEVEL.EISO) {
            if (new_admin_level === ADMIN_LEVEL.USER)
                throw new E.AdminError('invite others');

            // if (admin_level === ADMIN_LEVEL.SECONDARY)
            //     throw new E.AdminError('invite secondary admins to an organisation');
        }

        // as an organisation's system admin...
        // can invite user (0)
        // can invite secondary admins (3)
        if (creator_admin_level === ADMIN_LEVEL.SUPER) {
            if (new_admin_level === ADMIN_LEVEL.EISO)
                throw new E.AdminError('invite others');

            if (new_admin_level === ADMIN_LEVEL.SUPER)
                throw new E.AdminError('invite another primary admin');
        }

        // as an organisation's secondary admin...
        // if (decoded.admin_level === ADMIN_LEVEL.SECONDARY) {
        //     // can only invite user (0)
        //     if (admin_level !== ADMIN_LEVEL.USER)
        //         throw new E.AdminError('invite admins');
        // }

        // if (admin_level !== 1 && companyId === null) return res.status(400).send(r.error400({
        //     message: "Missing \"companyId\""
        // }));

        // there can only be one system admin for each org
        if (new_admin_level === ADMIN_LEVEL.SUPER) {
            const existingPrimaryAdmin = await Employees.findOne({
                where: {
                    fk_company_id: companyId,
                    admin_level: new_admin_level
                }
            });
            if (existingPrimaryAdmin)
                throw new E.AdminError('invite another primary admin');
        }

        // RUN THIS CODE IF THROWING AN ERROR
        // let data = {};
        // try {
        //     data = validators.validateFullName(req.body.name);
        // }
        // catch (error){
        //     console.log(error);
        //     return res.status(500).send(error);
        // }
        const name = validators.whitelistNameValidator(req.body.name);
        const title = validators.miscNameValidator(req.body.title);
        const email = validators.validateEmail(req.body.email);

        const json = { admin_level: new_admin_level, name, email };

        if (companyId !== undefined) {
            json.company_id = companyId;
            const row = await Companies.findByPk(companyId, {
                attributes: ['name', 'alias']
            });
            json.company_name = row.name;
            json.company_alias = row.alias;
            json.title = title;
        }

        const token = jwt.sign(json, jwtSecret, {
            expiresIn: '7d'
        });

        await User.Invitations.create({
            name, email, token,
            sent_by: created_by,
            fk_company_id: companyId
        });

        try {
            await sendEmail(
                email,
                'You\'ve been invited to join eISO',
                jumpContentTemplates[new_admin_level](name, token)
            );
        }
        catch (error) {
            // here, the email failed to be sent
            console.log(error);
            return res.status(201).send(r.success201({
                email: false,
                token,
                link: `${frontend.baseUrl}/create-account/${token}`
            }));
        }

        res.status(201).send(r.success201({
            email: true,
            token,
            link: `${frontend.baseUrl}/create-account/${token}`
        }));

        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findAllCompanyInvites = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const rows = await User.Invitations.findAll({
            where: { fk_company_id: companyId }
        });

        res.status(200).send(r.success200(rows));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.validateInvite = async (req, res, next) => {
    try {
        const {
            token,
            decoded: { admin_level, company_name, company_alias, title }
        } = res.locals.invite;

        const row = await User.Invitations.findOne({
            where: { token }
        });

        if (!row) throw new E.NotFoundError('invite');

        const json = {
            email: row.email,
            admin_level
        };

        if (row.fk_company_id !== null) {
            json.company_id = row.fk_company_id;
            json.company_name = company_name;
            json.company_alias = company_alias;
            json.title = title;
        }

        res.status(200).send(r.success200(json));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.registerInvite = async (req, res, next) => {
    try {
        const { decoded: { admin_level, company_id = null } } = res.locals.invite;

        const firstname  = validators.whitelistNameValidator(req.body.firstname);
        const lastname  = validators.whitelistNameValidator(req.body.lastname);
        const title = validators.miscNameValidator(req.body.title);
        const username = validators.usernameValidator(req.body.username);
        const email = validators.validateEmail(req.body.email);
        const password = validators.passwordValidator(req.body.password);
        const address = validators.addressValidator(req.body.address);

        const { employee_id } = await jumpRegister[admin_level](res.locals.invite, {
            company_id,
            firstname, lastname,
            title,
            username, email, password,
            address
        }, req.file);

        res.status(201).send(r.success201({ employee_id }));
        return next();
    }
    catch (error) {
        if (error.original?.code === 'ER_DUP_ENTRY')
            return next(new E.DuplicateError('user', 'username'));
        return next(error);
    }
};
