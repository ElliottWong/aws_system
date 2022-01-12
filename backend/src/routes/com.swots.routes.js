const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const swotController = require('../controllers/com.swots');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/swots', auth, swotController.findAllSwots);
router.post('/company/:companyId/swots', auth, swotController.insertSwot);

router.get('/company/:companyId/swots/:swotId', auth, swotController.findSwotById);
router.delete('/company/:companyId/swots/:swotId', auth, swotController.deleteSwot);

router.put('/company/:companyId/swot/reject/:swotId', auth, swotController.rejectSwot);
router.put('/company/:companyId/swot/approve/:swotId', auth, swotController.approveSwot);

router.get('/company/:companyId/swot/:status', auth, swotController.findSwotsByStatus);

module.exports = router;
