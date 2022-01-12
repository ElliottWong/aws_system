const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const roleController = require('../controllers/com.roles');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/roles', auth, roleController.findCompanyRoles);
router.post('/company/:companyId/roles', auth, roleController.insertRole);

router.get('/company/:companyId/role/:roleId', auth, roleController.findRoleById);
router.put('/company/:companyId/role/:roleId', auth, roleController.editRole);
router.delete('/company/:companyId/role/:roleId', auth, roleController.deleteRole);

// get an employee's roles
// call get employee by id with query "?roles=true"

// adds roles to an employee
router.post('/company/:companyId/employee/:employeeId/roles', auth, roleController.assignEmployeeRoles);

// check if an employee has rights to a module
router.get('/company/:companyId/employee/:employeeId/rights/:moduleId', auth, roleController.findEmployeeRights);

// get a list of employees that can edit a given module
router.get('/company/:companyId/edit/:moduleId/employees', auth, roleController.findEditingEmployees);

// get a list of employees that can approve a given module
router.get('/company/:companyId/approve/:moduleId/employees', auth, roleController.findApprovingEmployees);

module.exports = router;
