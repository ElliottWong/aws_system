const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const termsController = require('../controllers/com.terms');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/terms', auth, termsController.findTerm);
router.post('/company/:companyId/terms', auth, termsController.insertTerm);

module.exports = router;
