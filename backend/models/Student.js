const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  users_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  college_id: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  student_number: { type: String, required: true },
});

module.exports = mongoose.model("Student", StudentSchema);
