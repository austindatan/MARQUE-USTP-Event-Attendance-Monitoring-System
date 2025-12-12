const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  middlename: { type: String },
  lastname: { type: String, required: true },
  contact_number: { type: String },
  email: { type: String, required: false, unique: true },
  role: { type: String, enum: ["Admin", "Student"], required: true },
  profile_image: { type: String, default: "" }
});

module.exports = mongoose.model("User", userSchema);
