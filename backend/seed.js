require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seedDefaultUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas!");

    const existing = await User.findOne({ username: "sabrinaaryan" });
    if (existing) {
      console.log("ℹ️ Default user already exists. Skipping seeding.");
      return;
    }

    const hashedPassword = await bcrypt.hash("12345", 10);
    const userId = Math.floor(Math.random() * 10000);

    await User.create({
      user_id: userId,
      username: "sabrinaaryan",
      password: hashedPassword,
      firstname: "Sabrina",
      middlename: "Grande",
      lastname: "Aryan",
      contact_number: "09123456789",
      email: "sabrina@gmail.com",
      role: "user",
    });

    console.log("✅ Default user seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding default user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed.");
  }
}

seedDefaultUser();
