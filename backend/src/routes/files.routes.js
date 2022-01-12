const router = require('express').Router();

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams} = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus];

const fileController = require('../controllers/files');

router.get(
    '/file/info/:fileId',
    auth,
    fileController.findFileById
);

router.get(
    '/file/download/:fileId',
    auth,
    fileController.downloadFileById
);

module.exports = router;
