const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const partyController = require('../controllers/com.interesetdParties');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/interested-parties', auth, partyController.findAllInterestedParties);
router.post('/company/:companyId/interested-parties', auth, partyController.insertInterestedParties);

router.get('/company/:companyId/interested-parties/:partyId', auth, partyController.findInterestedPartiesById);
router.delete('/company/:companyId/interested-parties/:partyId', auth, partyController.deleteInterestedParties);

router.put('/company/:companyId/interested-party/reject/:partyId', auth, partyController.rejectInterestedParties);
router.put('/company/:companyId/interested-party/approve/:partyId', auth, partyController.approveInterestedParties);

router.get('/company/:companyId/interested-party/:status', auth, partyController.findInterestedPartiesByStatus);

module.exports = router;
