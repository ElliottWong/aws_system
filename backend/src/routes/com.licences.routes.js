const router = require('express').Router();

const { MODULE } = require('../config/enums');
const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary.v1');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const {
    checkAccountStatus,
    checkCompanyStatus
} = require('../middlewares/active');

const auth = [
    isLoggedIn,
    parseIdParams,
    checkAccountStatus,
    checkCompanyStatus,
    companyAccess
];

const licenceController = require('../controllers/com.licences');

// use query ?archived=1 or true for the two below routes to get archives

// tested
router.get(
    '/company/:companyId/licence-registry/all-licences',
    auth,
    licenceController.findLicences
);

// tested
router.get(
    '/company/:companyId/licence-registry/assigned-licences',
    auth,
    licenceController.findResponsibleLicences
);

// tested
router.get(
    '/company/:companyId/licence-registry/all-licences/:licenceId',
    auth,
    licenceController.findLicenceById
);

// tested
router.post(
    '/company/:companyId/licence-registry/all-licences',
    auth,
    licenceController.insertLicence
);

// tested
router.post(
    '/company/:companyId/licence-registry/all-licences/:licenceId/renewals',
    auth,
    uploadOne({
        field: 'renewal',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.PLC)
    }),
    licenceController.insertRenewalUpload,
    destroyUploads
);

// tested
router.put(
    '/company/:companyId/licence-registry/all-licences/:licenceId',
    auth,
    licenceController.editLicence
);

// tested
router.put(
    '/company/:companyId/licence-registry/all-licences/:licenceId/archive',
    auth,
    licenceController.archiveLicence
);

// tested
router.put(
    '/company/:companyId/licence-registry/all-licences/:licenceId/activate',
    auth,
    licenceController.activateLicence
);

router.delete(
    '/company/:companyId/licence-registry/all-licences/:licenceId',
    auth,
    licenceController.deleteLicence
);

// router.delete(
//     '/company/:companyId/licence-registry/all-licences/:licenceId/renewals/:renewalId',
//     auth,
//     licenceController.deleteRenewal
// );

module.exports = router;
