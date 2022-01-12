const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const scopeController = require('../controllers/com.scopes');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/scopes', auth, scopeController.findScope);
router.post('/company/:companyId/scopes', auth, scopeController.insertScope);

module.exports = router;
