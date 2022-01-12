const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const policyController = require('../controllers/com.policies');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/policies', auth, policyController.findAllPolicy);
router.post('/company/:companyId/policies', auth, policyController.insertPolicy);

router.get('/company/:companyId/policies/:policyId', auth, policyController.findPolicyById);
router.delete('/company/:companyId/policies/:policyId', auth, policyController.deletePolicy);

router.put('/company/:companyId/policy/reject/:policyId', auth, policyController.rejectPolicy);
router.put('/company/:companyId/policy/approve/:policyId', auth, policyController.approvePolicy);

router.get('/company/:companyId/policy/:status', auth, policyController.findPolicyByStatus);

module.exports = router;
