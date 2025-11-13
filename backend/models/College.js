const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema(
    {
        college_code: { type: String },
        college_name: { type: String, required: true },
    },
);

const College = mongoose.model('College', CollegeSchema);
module.exports = College;