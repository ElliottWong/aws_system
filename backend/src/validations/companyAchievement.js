const yup = require('yup');

module.exports.achievementSchema = yup.array().of(yup.object().shape({
    function: yup.string().required(),
    quality_objective: yup.string().required(),
    personel_responsible: yup.number().positive().integer().required(),
    data_collection: yup.string().required(),
    data_analysis: yup.string().required(),
    display_order: yup.number().positive().integer().required(),
    parent_item_id: yup.number().positive().integer().required(),
    files: yup.array().of(yup.object().shape({
        new: yup.boolean(),
        deleted: yup.boolean(),
        file_id: yup.number().positive().integer(),
        name: yup.string().required(),
        key: yup.string()
    })).ensure()
}));
