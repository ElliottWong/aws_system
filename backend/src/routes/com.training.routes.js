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

// get training requests/records of an employee

// tested
// requests from an employee (created_by)
router.get(
    '/company/:companyId/employee/:employeeId/training-requests',
    auth,
    trainingController.findEmployeeRequests
);

// tested
// records of an employee (created_by)
router.get(
    '/company/:companyId/employee/:employeeId/training-records',
    auth,
    trainingController.findEmployeeRecords
);

// all training requests/records in a company

/* router.get(
    '/company/:companyId/training/all-requests',
    auth,
    trainingController.findAllRequests
); */

/* router.get(
    '/company/:companyId/training/all-records',
    auth,
    trainingController.findAllRecords
); */

// pending requests for logged in user to approve (approved_by)
router.get(
    '/company/:companyId/training/pending-requests',
    auth,
    trainingController.findPendingRequests
);

// requests that were rejected by logged in user (approved_by)
router.get(
    '/company/:companyId/training/rejected-requests',
    auth,
    trainingController.findRejectedRequests
);

// records that were approved by logged in user (approved_by)
router.get(
    '/company/:companyId/training/approved-records',
    auth,
    trainingController.findApprovedRecords
);

// requests/records that the logged in user is approver of (approved_by)
router.get(
    '/company/:companyId/training/requests-approver',
    auth,
    trainingController.findAllApprovedBy
);

// get one specific training request/record
router.get(
    '/company/:companyId/training/all-requests/:trainingId',
    auth,
    trainingController.findRequestOrRecord
);

// new request
// tested
router.post(
    '/company/:companyId/training/all-requests',
    auth,
    uploadOne({
        field: 'justification',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.TRAINING_REQUESTS)
    }),
    trainingController.insertTrainingRequest,
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
// can be edited before approval
// router.put(
//     '/company/:companyId/training/all-requests/:trainingId',
//     auth
// );

// tested
router.put(
    '/company/:companyId/training/reject-request/:trainingId',
    auth,
    trainingController.rejectRequest
);

// tested
router.put(
    '/company/:companyId/training/approve-request/:trainingId',
    auth,
    trainingController.approveRequest
);

// cancel any pending/approved request/record (created_by)
router.put(
    '/company/:companyId/training/cancel-request/:trainingId',
    auth,
    trainingController.cancelRequestOrRecord
);

// delete rejected requests (created_by)
router.delete(
    '/company/:companyId/training/rejected-requests/:trainingId',
    auth,
    trainingController.deleteRejectedRequest
);

module.exports = router;
