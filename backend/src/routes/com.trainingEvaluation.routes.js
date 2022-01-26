const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const trainingEvaluationController = require('../controllers/com.trainingEvaluation');

// only can get approved records
// fills the record with evaluation template
// selects active evaluation template at time of request
router.get(
    '/company/:companyId/training-evaluation/evaluate-record/:trainingId',
    auth,
    trainingEvaluationController.evaluateRecord
);

router.put(
    '/company/:companyId/training-evaluation/evaluate-record/:trainingId',
    auth,
    trainingEvaluationController.editRecordEvaluation
);

router.get(
    '/company/:companyId/training-evaluation/active-template',
    auth,
    trainingEvaluationController.findActiveEvalautionTemplate
);

router.get(
    '/company/:companyId/training-evaluation/all-templates',
    auth,
    trainingEvaluationController.findEvaluationTemplates
);

router.get(
    '/company/:companyId/training-evaluation/all-templates/:templateId',
    auth,
    trainingEvaluationController.findEvaluationTemplate
);

router.post(
    '/company/:companyId/training-evaluation/all-templates',
    auth,
    trainingEvaluationController.insertEvaluationTemplate
);

router.put(
    '/company/:companyId/training-evaluation/all-templates/:templateId',
    auth,
    trainingEvaluationController.editEvaluationTemplate
);

router.put(
    '/company/:companyId/training-evaluation/all-templates/:templateId/activate',
    auth,
    trainingEvaluationController.activateEvaluationTemplate
);

module.exports = router;
