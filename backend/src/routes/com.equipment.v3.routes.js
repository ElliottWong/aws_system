const router = require('express').Router();

const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const equipmentController = require('../controllers/com.equipment.v3');

// CATEGORIES

// only needs categories, dont need equipment and their maintenance
router.get(
    '/company/:companyId/equipment-maintenance-program/categories',
    auth,
    equipmentController.findCategories
);

// only one category,
// but can have every equipment and their maintenance
router.get(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId/all',
    auth,
    equipmentController.findCategoryWithAllEquipment
);

// only one category,
// but can have every *assigned* equipment and their maintenance
router.get(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId/assignments',
    auth,
    equipmentController.findCategoryWithAssignedEquipment
);

router.post(
    '/company/:companyId/equipment-maintenance-program/categories',
    auth,
    equipmentController.insertCategory
);

router.put(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId',
    auth,
    equipmentController.editCategory
);

router.delete(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId',
    auth,
    equipmentController.deleteCategory
);

// EQUIPMENT

// get many equipment
// -> categories
// -> many maintenance
//    -> assignees

router.get(
    '/company/:companyId/equipment-maintenance-program/equipment/all',
    auth,
    equipmentController.findAllEquipment
);

router.get(
    '/company/:companyId/equipment-maintenance-program/equipment/assignments',
    auth,
    equipmentController.findAllResponsibleEquipment
);

router.get(
    '/company/:companyId/equipment-maintenance-program/equipment/archives',
    auth,
    equipmentController.findAllArchivedEquipment
);

router.get(
    '/company/:companyId/equipment-maintenance-program/equipment/all/:equipmentId',
    auth,
    equipmentController.findOneEquipment
);

router.post(
    '/company/:companyId/equipment-maintenance-program/equipment/all',
    auth,
    equipmentController.insertOneEquipment
);

router.put(
    '/company/:companyId/equipment-maintenance-program/equipment/all/:equipmentId',
    auth,
    equipmentController.editOneEquipment
);

router.put(
    '/company/:companyId/equipment-maintenance-program/equipment/all/:equipmentId/archive',
    auth,
    equipmentController.archiveOneEquipment
);

router.put(
    '/company/:companyId/equipment-maintenance-program/equipment/all/:equipmentId/activate',
    auth,
    equipmentController.activateOneEquipment
);

router.delete(
    '/company/:companyId/equipment-maintenance-program/equipment/all/:equipmentId',
    auth,
    equipmentController.deleteOneEquipment
);

module.exports = router;
