const router = require('express').Router();

// ROUTERS
// Clauses 1 - 3
const scopeRouter = require('./com.scopes.routes');
const referenceRouter = require('./com.references.routes');
const termsRouter = require('./com.terms.routes');

// Clause 4
const swotRouter = require('./com.swots.routes');
const partyRouter = require('./com.interestedParties.routes');
const qmsScopeRouter = require('./com.qmsScopes.routes');

// Clause 5
const policyRouter = require('./com.policies.routes');
const chartRouter = require('./com.charts.routes');
const roleRouter = require('./com.roles.routes');

// Clause 6
const analysisRouter = require('./com.risksAnalyses.routes');
const achievementRouter = require('./com.achievements.routes');

// clause 7
const equipmentRouter = require('./com.equipment.v3.routes');
const maintenanceRouter = require('./com.equipmentMaintenance.routes');
const licenceRouter = require('./com.licences.routes');
const trainingRouter = require('./com.training.routes');

// other routers
const accountRouter = require('./accounts.routes');
const authRouter = require('./auth.routes');
const companyRouter = require('./companies.routes');
const employeeRouter = require('./employees.routes');
const fileRouter = require('./files.routes');
const invitationRouter = require('./invitations.routes');

// dev
const devRouter = require('./_dev');

// middlewares
const errorHandler = require('../middlewares/errorHandler');
const accessLogging = require('../middlewares/morgan');

router.use(accessLogging);

router.get('/', (req, res) => {
    res.status(200).send('Privet from the ADES eISO backend!');
});

// Clauses 1 - 3
router.use(scopeRouter);
router.use(referenceRouter);
router.use(termsRouter);

// Clause 4
router.use(swotRouter);
router.use(partyRouter);
router.use(qmsScopeRouter);

// Clause 5
router.use(policyRouter);
router.use(chartRouter);
router.use(roleRouter);

// Clause 6
router.use(analysisRouter);
router.use(achievementRouter);

// Clause 7
router.use(equipmentRouter);
router.use(maintenanceRouter);
router.use(licenceRouter);
router.use(trainingRouter);

// other routers
router.use(accountRouter);
router.use(authRouter);
router.use(companyRouter);
router.use(employeeRouter);
router.use(fileRouter);
router.use(invitationRouter);

// dev
router.use(devRouter);

// central error handler
router.use(errorHandler);

module.exports = router;
