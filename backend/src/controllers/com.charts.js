const {
    insertChart,
    findCharts,
    editChart,
    deleteChart
} = require('../models/com.charts');

const { findRights } = require('../models/com.roles');

const E = require('../errors/Errors');
const r = require('../utils/response').responses;

// CREATE

module.exports.insertChart = async (req, res, next) => {
    try {
        const { fk_employee_id: created_by } = res.locals.account;
        const { companyId } = req.params;

        // check author for edit rights
        const { edit } = await findRights(created_by, companyId, 'm05_03');
        if (!edit) throw new E.PermissionError('create');

        // data from request body
        const { title, description, display_order } = req.body;
        const { chart_id } = await insertChart({ companyId, created_by, title, description, display_order }, req.upload);

        return res.status(201).send(r.success200({ chart_id }));
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// READ

module.exports.findAllCharts = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const forms = await findCharts({
            where: { fk_company_id: companyId }
        });

        res.status(200).send(r.success200(forms));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

module.exports.findChartById = async (req, res, next) => {
    try {
        const { companyId, chartId } = req.params;

        const [found] = await findCharts({
            where: {
                fk_company_id: companyId,
                chart_id: chartId
            },
            limit: 1
        });
        if (!found) throw new E.NotFoundError('organisation chart');

        res.status(200).send(r.success200(found));
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// UPDATE

module.exports.editChart = async (req, res, next) => {
    try {
        const { fk_employee_id: edited_by } = res.locals.account;
        const { companyId, chartId } = req.params;

        const { edit } = await findRights(edited_by, companyId, 'm05_03');
        if (!edit) throw new E.PermissionError('edit');

        const { title, description, display_order } = req.body;
        await editChart({ companyId, chartId, title, description, display_order });

        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};

// ============================================================

// DELETE

module.exports.deleteChart = async (req, res, next) => {
    try {
        const { fk_employee_id: deleted_by } = res.locals.account;
        const { companyId, chartId } = req.params;

        const { edit } = await findRights(deleted_by, companyId, 'm05_03');
        if (!edit) throw new E.PermissionError('delete');

        await deleteChart(companyId, chartId);
        res.status(200).send(r.success200());
        return next();
    }
    catch (error) {
        return next(error);
    }
};
