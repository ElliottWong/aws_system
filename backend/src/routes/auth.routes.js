const router = require('express').Router();

// const { isLoggedIn } = require('../middlewares/auth');
// const { parseIdParams, companyAccess } = require('../middlewares/access');
// const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const authController = require('../controllers/auth');

router.post('/login', authController.clientLogin);
router.post('/admin/login', authController.adminLogin);

// REFRESH TOKEN
router.post('/refresh', authController.useRefreshToken);

// LOGOUT
router.post('/logout', authController.logout);

module.exports = router;
