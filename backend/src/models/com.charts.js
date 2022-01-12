const { Op } = require('sequelize');

const {
    Files,
    Employees,
    User: { Accounts },
    Documents: { OrganisationCharts }
} = require('../schemas/Schemas');

const { insertFileRecord } = require('./files');

const c = require('../services/cloudinary');
const E = require('../errors/Errors');

// CREATE

module.exports.insertChart = async (data = {}, uploadedFile) => {
    const {
        companyId,
        created_by,
        title,
        description,
        display_order
    } = data;

    const { file_id } = await insertFileRecord(uploadedFile.originalname, {
        public_id: uploadedFile.filename,
        secure_url: uploadedFile.path
    }, created_by);

    const row = await OrganisationCharts.create({
        fk_company_id: companyId,
        created_by, title, description, display_order,
        fk_file_id: file_id
    });

    return row;
};

// ============================================================

// READ

module.exports.findCharts = ({ where, ...others } = {}) => {
    // provide operators so controller does not need to import it
    const w = typeof where === 'function' ? where(Op) : where;

    // construct the join queries
    const join = {
        include: [{
            model: Employees,
            as: 'author',
            include: {
                model: Accounts,
                as: 'account',
                attributes: ['username']
            }
        }, {
            model: Files,
            as: 'file',
            attributes: { exclude: ['cloudinary_id', 'cloudinary_uri'] }
        }]
    };

    return OrganisationCharts.findAll({ where: w, ...join, ...others });
};

// ============================================================

// UPDATE

module.exports.editChart = async (data = {}) => {
    const {
        companyId,
        chartId,
        title,
        description,
        display_order
    } = data;

    const chart = await OrganisationCharts.findOne({
        where: {
            chart_id: chartId,
            fk_company_id: companyId
        }
    });
    if (!chart) throw new E.NotFoundError('organisation chart');

    return await chart.update({ title, description, display_order });
};

// ============================================================

// DELETE

module.exports.deleteChart = async (fk_company_id, chart_id) => {
    const chart = await OrganisationCharts.findOne({
        where: { chart_id, fk_company_id },
        include: 'file'
    });
    if (!chart) throw new E.NotFoundError('organisation chart');

    await c.deleteFile(chart.file.cloudinary_id);

    const destroyed = await Promise.all([
        chart.file.destroy(),
        chart.destroy()
    ]);

    return destroyed.reduce((accumulator, current) => accumulator + current, 0);
};
