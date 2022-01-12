const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const accountController = require('../controllers/accounts');

router.post('/forget-password/otp/new', accountController.requestOtp);
router.post('/forget-password/otp/check', accountController.validateOtp);
router.post('/forget-password/otp/change', accountController.changePasswordWithOtp);
router.post('/forget-password/change', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, accountController.changePasswordLoggedIn);

module.exports = router;
