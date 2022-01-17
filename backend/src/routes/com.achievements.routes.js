const router = require('express').Router();

const { uploadAny, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary.v1');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const achievementController = require('../controllers/com.achievements');

// "combining" multiple middlewares
// https://stackoverflow.com/a/36649698
// https://stackoverflow.com/a/65587573
const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/objective-achievements', auth, achievementController.findAllAchievements);

// the auth is split because i dont want uploads to wait for db queries
// in the middlewares that check status
router.post(
    '/company/:companyId/objective-achievements',
    auth,
    uploadAny({
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, 'm06_02')
    }),
    achievementController.insertAchievemnt,
    destroyUploads
);

router.get('/company/:companyId/objective-achievements/:achievementId', auth, achievementController.findAchievementById);
router.delete('/company/:companyId/objective-achievements/:achievementId', auth, achievementController.deleteAchievement);

router.put('/company/:companyId/objective-achievement/reject/:achievementId', auth, achievementController.rejectAchievement);
router.put('/company/:companyId/objective-achievement/approve/:achievementId', auth, achievementController.approveAchievement);

router.get('/company/:companyId/objective-achievement/:status', auth, achievementController.findAchievementsByStatus);

module.exports = router;
