const router = require('express').Router();

const { MODULE } = require('../config/enums');
const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary.v1');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const trainingController = require('../controllers/com.training');

// training requests are requests pending approval
// training records are request that has been approved

// get training requests of an employee
router.get(
    '/company/:companyId/employee/:employeeId/training-requests',
    auth,
    trainingController.findEmployeeRequests
);

// all training requests in a company
// router.get(
//     '/company/:companyId/training/all-requests'
// );

// pending requests for logged in user to approve
router.get(
    '/company/:companyId/training/pending-requests',
    auth,
    trainingController.findPendingRequests
);

// get one specific training request
router.get(
    '/company/:companyId/training/all-requests/:trainingId',
    auth,
    trainingController.findRequest
);

// new request
router.post(
    '/company/:companyId/training/all-requests',
    auth,
    uploadOne({
        field: 'justification',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.TRAINING_REQUESTS)
    }),
    trainingController.insertTraining,
    destroyUploads
);

// submit training attendance
router.post(
    '/company/:companyId/training/all-requests/:trainingId',
    auth,
    uploadOne({
        field: 'attendance',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.TRAINING_REQUESTS)
    }),
    trainingController.insertAttendance,
    destroyUploads
);

// edit training
router.put(
    '/company/:companyId/training/all-requests/:trainingId',
    auth
);

router.delete(
    '/company/:companyId/training/all-requests/:trainingId',
    auth
);

module.exports = router;
