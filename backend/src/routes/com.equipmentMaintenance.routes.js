const router = require('express').Router();

const { MODULE } = require('../config/enums');
const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary.v1');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const maintenanceController = require('../controllers/com.equipmentMaintenance');

router.get(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId',
    auth,
    maintenanceController.findOneMaintenance
);

// tested
router.post(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance',
    auth,
    maintenanceController.insertOneMaintenance
);

// tested
router.post(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId/uploads',
    auth,
    uploadOne({
        field: 'maintenance',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, MODULE.EMP)
    }),
    maintenanceController.insertMaintenanceUpload,
    destroyUploads
);

// tested
router.put(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId',
    auth,
    maintenanceController.editOneMaintenance
);

// router.put(
//     '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId/uploads/:uploadId',
//     auth,
//     maintenanceController.editMaintenanceUpload
// );

router.delete(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId',
    auth,
    maintenanceController.deleteOneMaintenance
);

router.delete(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/all-maintenance/:maintenanceId/uploads/:uploadId',
    auth,
    maintenanceController.deleteMaintenanceUpload
);

module.exports = router;
