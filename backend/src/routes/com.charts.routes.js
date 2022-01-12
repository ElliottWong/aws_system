const router = require('express').Router();

const { uploadOne, destroyUploads } = require('../middlewares/multer');
const { formDocumentsFolderPath } = require('../services/cloudinary');

const { isLoggedIn } = require('../middlewares/auth');
const { parseIdParams, companyAccess } = require('../middlewares/access');
const { checkAccountStatus, checkCompanyStatus } = require('../middlewares/active');

const chartController = require('../controllers/com.charts.js');

// "combining" multiple middlewares
// https://stackoverflow.com/a/36649698
// https://stackoverflow.com/a/65587573
const auth = [isLoggedIn, parseIdParams, checkAccountStatus, checkCompanyStatus, companyAccess];

router.get('/company/:companyId/org-charts', auth, chartController.findAllCharts);

// the auth is split because i dont want uploads to wait for db queries
// in the middlewares that check status
router.post(
    '/company/:companyId/org-charts',
    auth,
    uploadOne({
        field: 'chart',
        to: (req, res) => formDocumentsFolderPath(req.params.companyId, 'm05_03')
    }),
    chartController.insertChart,
    destroyUploads
);

router.get('/company/:companyId/org-chart/:chartId', auth, chartController.findChartById);

router.put('/company/:companyId/org-chart/:chartId', auth, chartController.editChart);

router.delete('/company/:companyId/org-chart/:chartId', auth, chartController.deleteChart);

module.exports = router;
