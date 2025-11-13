const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  middlename: { type: String },
  lastname: { type: String, required: true },
  contact_number: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Manager", "Committee",], required: true },
});

module.exports = mongoose.model("User", userSchema);
