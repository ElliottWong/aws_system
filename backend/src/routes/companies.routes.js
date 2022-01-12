const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess, onlyPlatformAdminAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const companyController = require('../controllers/companies');

// const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/companies', isLoggedIn, parseIdParams, onlyPlatformAdminAccess, companyController.findAllCompanies);
router.post('/companies', isLoggedIn, parseIdParams, onlyPlatformAdminAccess, companyController.insertCompany);

router.get('/companies/:companyId', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess, companyController.findCompanyById);
router.put('/companies/:companyId', isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess, companyController.editCompany);

module.exports = router;
