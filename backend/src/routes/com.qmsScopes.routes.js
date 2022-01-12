const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const qmsScopeController = require('../controllers/com.qmsScopes');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/qms-scopes', auth, qmsScopeController.findAllQmsScopes);
router.post('/company/:companyId/qms-scopes', auth, qmsScopeController.insertQmsScope);

router.get('/company/:companyId/qms-scopes/:qmsId', auth, qmsScopeController.findQmsScopeById);
router.delete('/company/:companyId/qms-scopes/:qmsId', auth, qmsScopeController.deleteQmsScope);

router.put('/company/:companyId/qms-scope/reject/:qmsId', auth, qmsScopeController.rejectQmsScope);
router.put('/company/:companyId/qms-scope/approve/:qmsId', auth, qmsScopeController.approveQmsScope);

router.get('/company/:companyId/qms-scope/:status', auth, qmsScopeController.findQmsScopeByStatus);

module.exports = router;
