const router = require('express').Router();

const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary.v1');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const equipmentController = require('../controllers/com.equipment.v2');

// find all equipment (for those who can create new equipment)
router.get(
    '/company/:companyId/equipment/all',
    auth,
    equipmentController.findAllEquipment
);

// find all equipment the logged in user is responsible for
router.get(
    '/company/:companyId/equipment/responsible',
    auth,
    equipmentController.findAllResponsibleEquipment
);

// get all archived equipment
router.get(
    '/company/:companyId/equipment/archives',
    auth,
    equipmentController.findAllArchivedEquipment
);

// find equipment by id
router.get(
    '/company/:companyId/equipment/all/:equipmentId',
    auth,
    equipmentController.findOneEquipmentById
);

// insert one equipment
router.post(
    '/company/:companyId/equipment/all',
    auth,
    equipmentController.insertOneEquipment
);

// upload maintenace for an equipment
router.post(
    '/company/:companyId/equipment/all/:equipmentId/maintenance',
    auth,
    uploadOne({
        field: 'maintenance',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, 'm07_01')
    }),
    equipmentController.insertMaintenanceUplaod,
    destroyUploads
);

// update one equipment
router.put(
    '/company/:companyId/equipment/all/:equipmentId',
    auth,
    equipmentController.editOneEquipment
);

// do these 2 routes make any sense
// archive one equipment
router.post(
    '/company/:companyId/equipment/archives/:equipmentId',
    auth,
    equipmentController.archiveOneEquipment
);

// undo archival of one equipmet
router.delete(
    '/company/:companyId/equipment/archives/:equipmentId',
    auth,
    equipmentController.activateOneEquipment
);

// delete one equipment
router.delete(
    '/company/:companyId/equipment/all/:equipmentId',
    auth,
    equipmentController.deleteOneEquipment
);

module.exports = router;
