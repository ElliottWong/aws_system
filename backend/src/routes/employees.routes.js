const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess, onlyPlatformAdminAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const employeeController = require('../controllers/employees');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get(
    '/company/:companyId/employees',
    auth,
    (req, res, next) => employeeController.findEmployees(req, res, next, false)
);

router.get(
    '/company/:companyId/employees/:employeeId',
    auth,
    (req, res, next) => employeeController.findEmployeeById(req, res, next, false)
);

router.put(
    '/company/:companyId/employees/:employeeId',
    auth,
    (req, res, next) => employeeController.editEmployee(req, res, next, false)
);

// PLATFORM ADMINS
router.get(
    '/admins',
    isLoggedIn,
    onlyPlatformAdminAccess,
    (req, res, next) => employeeController.findEmployees(req, res, next, true)
);

router.get(
    '/admins/:employeeId',
    isLoggedIn,
    onlyPlatformAdminAccess,
    (req, res, next) => employeeController.findEmployeeById(req, res, next, true)
);

router.put(
    '/admins/:employeeId',
    isLoggedIn,
    onlyPlatformAdminAccess,
    (req, res, next) => employeeController.editEmployee(req, res, next, true)
);

module.exports = router;
