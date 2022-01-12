const router = require('express').Router();

const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const licenceController = require('../controllers/com.licences');

router.get(
    '/company/:companyId/licences/all',
    auth,
    licenceController.findLicences
);

router.get(
    '/company/:companyId/licences/responsible',
    auth,
    licenceController.findResponsibleLicences
);

router.get(
    '/company/:companyId/licences/archives',
    auth,
    licenceController.findArchivedLicences
);

router.get(
    '/company/:companyId/licences/all/:licenceId',
    auth,
    licenceController.findLicenceById
);

router.post(
    '/company/:companyId/licences/all',
    auth,
    licenceController.insertLicence
);

router.post(
    '/company/:companyId/licences/all/:licenceId/renewal',
    auth,
    uploadOne({
        field: 'renewal',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, 'm07_01')
    }),
    licenceController.insertRenewalUpload,
    destroyUploads
);

router.put(
    '/company/:companyId/licences/all/:licenceId',
    auth,
    licenceController.editLicence
);

// do these 2 routes make any sense
router.post(
    '/company/:companyId/licences/archives/:licenceId',
    auth,
    licenceController.archiveLicence
);

router.delete(
    '/company/:companyId/licences/archives/:licenceId',
    auth,
    licenceController.activateLicence
);

router.delete(
    '/company/:companyId/licences/all/:licenceId',
    auth,
    licenceController.deleteLicence
);

module.exports = router;
