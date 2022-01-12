const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, onlyCompanyAccess, onlyPlatformAdminAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');
const { validateInviteToken } = require('../middlewares/invite');

const inviteController = require('../controllers/invitations');

// PLATFORM INVITATIONS
// platform admin invites another platform admin
// only uses the same endpoint for validation
router.post('/invites/new/pa');

// platform admin registration
router.post('/invites/accept/:inviteToken');

// COMPANY INVITATIONS
// all invites in a company
router.get('/company/:companyId/invites', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, onlyCompanyAccess, inviteController.findAllCompanyInvites);

// create new user invite
router.post('/company/:companyId/invites/new/user', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, onlyCompanyAccess, (req, res, next) => inviteController.createInvite(req, res, next, 0));

// create new secondary admin invite
router.post('/company/:companyId/invites/new/secondary', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, onlyCompanyAccess, (req, res, next) => inviteController.createInvite(req, res, next, 3));

// create new system admin invite
// platform admin invites an organisation's first (and only) system admin
// the system admin will follow the endpoints below in the next section
router.post('/company/:companyId/invites/new/system', isLoggedIn, parseIdParams, onlyPlatformAdminAccess, (req, res, next) => inviteController.createInvite(req, res, next, 2));

// validate the token (used by all)
router.get('/invites/:inviteToken', validateInviteToken, inviteController.validateInvite);

// accepts and registers account
router.post('/company/:companyId/invites/accept/:inviteToken', validateInviteToken, parseIdParams, inviteController.registerInvite);

module.exports = router;
