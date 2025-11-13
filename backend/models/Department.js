const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
    {
        college_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'College',
            required: true,
        },
        department_code: { type: String },
        department_name: { type: String, required: true },
    },
);

const Department = mongoose.model('Department', DepartmentSchema);

module.exports = Department;