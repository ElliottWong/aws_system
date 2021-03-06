const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

const equipmentController = require('../controllers/com.equipment');

// CATEGORIES

// only needs categories, dont need equipment and their maintenance
// tested
router.get(
    '/company/:companyId/equipment-maintenance-program/categories',
    auth,
    equipmentController.findCategories
);

// every equipment in a category
// includes their maintenance
// tested
router.get(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId/all-equipment',
    auth,
    equipmentController.findAllEquipmentInCategory
);

// every assigned equipment in a category
// includes their maintenance
// tested
router.get(
    '/company/:companyId/equipment-maintenance-program/categories/:categoryId/assigned-equipment',
    auth,
    equipmentController.findAllResponsibleEquipmentInCategory
);

// tested
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
    '/company/:companyId/equipment-maintenance-program/all-equipment',
    auth,
    equipmentController.findAllEquipment
);

router.get(
    '/company/:companyId/equipment-maintenance-program/assigned-equipment',
    auth,
    equipmentController.findAllResponsibleEquipment
);

// get archived equipment with query ?archived=1 or true

// find one regardless of archival
// as an equipment owner, see everything
// but assigned employees can only see the equipment
// if a maintenance of said equipment is assigned to them
router.get(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId',
    auth,
    equipmentController.findOneEquipment
);

// tested
router.post(
    '/company/:companyId/equipment-maintenance-program/all-equipment',
    auth,
    equipmentController.insertOneEquipment
);

// tested
router.put(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId',
    auth,
    equipmentController.editOneEquipment
);

// archival and activation are separate

// tested
router.put(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/archive',
    auth,
    equipmentController.archiveOneEquipment
);

// tested
router.put(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId/activate',
    auth,
    equipmentController.activateOneEquipment
);

router.delete(
    '/company/:companyId/equipment-maintenance-program/all-equipment/:equipmentId',
    auth,
    equipmentController.deleteOneEquipment
);

module.exports = router;
