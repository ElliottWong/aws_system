const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const analysisController = require('../controllers/com.risksAnalyses');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/risks-analyses', auth, analysisController.findAllAnalyses);
router.post('/company/:companyId/risks-analyses', auth, analysisController.insertAnalysis);

router.get('/company/:companyId/risks-analyses/:analysisId', auth, analysisController.findAnalysisById);
router.delete('/company/:companyId/risks-analyses/:analysisId', auth, analysisController.deleteAnalysis);

router.put('/company/:companyId/risks-analysis/reject/:analysisId', auth, analysisController.rejectAnalysis);
router.put('/company/:companyId/risks-analysis/approve/:analysisId', auth, analysisController.approveAnalysis);

router.get('/company/:companyId/risks-analysis/:status', auth, analysisController.findAnalysesByStatus);

module.exports = router;
