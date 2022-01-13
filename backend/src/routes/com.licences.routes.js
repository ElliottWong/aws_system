const router = require('express').Router();

const { MODULE } = require('../config/enums');
const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const licenceController = require('../controllers/com.licences');

// use query ?archived=1 or true for the two below routes to get archives

router.get(
    '/company/:companyId/all-licences',
    auth,
    licenceController.findLicences
);

router.get(
    '/company/:companyId/assigned-licences',
    auth,
    licenceController.findResponsibleLicences
);

router.get(
    '/company/:companyId/all-licences/:licenceId',
    auth,
    licenceController.findLicenceById
);

router.post(
    '/company/:companyId/all-licences',
    auth,
    licenceController.insertLicence
);

router.post(
    '/company/:companyId/all-licences/:licenceId/renewal',
    auth,
    uploadOne({
        field: 'renewal',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.PLC)
    }),
    licenceController.insertRenewalUpload,
    destroyUploads
);

router.put(
    '/company/:companyId/all-licences/:licenceId',
    auth,
    licenceController.editLicence
);

router.put(
    '/company/:companyId/all-licences/:licenceId/archive',
    auth,
    licenceController.archiveLicence
);

router.put(
    '/company/:companyId/all-licences/:licenceId/activate',
    auth,
    licenceController.activateLicence
);

router.delete(
    '/company/:companyId/all-licences/:licenceId',
    auth,
    licenceController.deleteLicence
);

module.exports = router;
