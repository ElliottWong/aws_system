const router = require('express').Router();

const { Companies } = require('../schemas/Schemas');

const accessLogging = require('../middlewares/morgan');
const { uploadAny, uploadOne, destroyUploads } = require('../middlewares/multer');

const { findEquipment } = require('../models/com.equipment.v3');

const E = require('../errors/Errors');

router.post(
    '/dev/upload/any',
    uploadAny({
        to: (req, res) => 'test-multer-cloudinary-storage-engine'
    }),
    (req, res) => {
        console.log(req.uploads);
        res.status(200).send();
    },
    destroyUploads
);

router.post(
    '/dev/upload/one',
    uploadOne({
        field: 'x',
        to: 'test-multer-cloudinary-storage-engine'
    }),
    (req, res) => {
        console.log(req.upload);
        res.status(200).send();
    },
    destroyUploads
);

router.get(
    '/dev/logging/access',
    accessLogging,
    (req, res, next) => {
        res.send('hello');
    }
);

router.get(
    '/dev/error/generic',
    (req, res, next) => {
        next(new Error('generic error'));
    }
);

router.get(
    '/dev/error/custom',
    (req, res, next) => {
        next(new E.BaseError());
    }
);

router.get(
    '/dev/error/sql',
    async (req, res, next) => {
        try {
            await Companies.create({});
        }
        catch (error) {
            return next(error);
        }
    }
);

router.get(
    '/dev/emp/all/:companyId',
    async (req, res, next) => {
        try {
            const { companyId } = req.params;
            console.log(companyId);

            const results = await findEquipment.all({
                companyId,
                includeMaintenance: true,
                includeMaintenanceAssignees: true,
                includeMaintenanceUploads: true
            });

            res.status(200).send(results);
            return next();
        }
        catch (error) {
            return next(error);
        }
    }
);

router.get(
    '/dev/emp/assigned/:employeeId',
    async (req, res, next) => {
        try {
            const { employeeId } = req.params;
            console.log(employeeId);

            const results = await findEquipment.allResponsible({
                employeeId,
                includeMaintenance: true,
                includeMaintenanceAssignees: true,
                includeMaintenanceUploads: true
            });

            res.status(200).send(results);
            return next();
        }
        catch (error) {
            return next(error);
        }
    }
);

module.exports = router;
