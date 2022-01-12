const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const referenceController = require('../controllers/com.references');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/references', auth, referenceController.findReference);
router.post('/company/:companyId/references', auth, referenceController.insertReference);

module.exports = router;
