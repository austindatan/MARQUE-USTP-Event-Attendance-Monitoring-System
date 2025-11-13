require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Student = require("./models/Student");
const College = require("./models/College");
const Department = require("./models/Department");

async function Seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    await College.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});

    // College
    const coll1 = await College.create({ college_code: "CITC", college_name: "College of Information Technology and Computing" });
    const coll2 = await College.create({ college_code: "CE", college_name: "College of Engineering" });

    // Department
    const dept1 = await Department.create({ college_id: coll1._id, department_code: "BSIT", department_name: "Bachelor of Science in Information Technology" });
    const dept2 = await Department.create({ college_id: coll2._id, department_code: "BSCE", department_name: "Computer Engineering" });

    const lastUser = await User.findOne().sort({ user_id: -1 }).limit(1);
    let nextUserId = lastUser ? lastUser.user_id + 1 : 1;

    // Sabrina
    const hashedPassSabrina = await bcrypt.hash("12345", 10);
    const sabrina = await User.create({
      user_id: nextUserId++,
      username: "sabrinaaryan",
      password: hashedPassSabrina,
      firstname: "Sabrina",
      middlename: "Grande",
      lastname: "Aryan",
      contact_number: "09123456789",
      email: "sabrina@gmail.com",
      role: "Student",
      profile_image: "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/sabrina_profile.jpg?raw=true",
    });

    await Student.create({
      users_id: sabrina._id,
      college_id: coll1._id,
      department_id: dept1._id,
      student_number: "20233300120",
    });

    // Neka
    const hashedPassNeka = await bcrypt.hash("nekaneks", 10);
    const neka = await User.create({
      user_id: nextUserId++,
      username: "nekaneks",
      password: hashedPassNeka,
      firstname: "Nikka",
      middlename: "Sabrina",
      lastname: "Rodriguez",
      contact_number: "09123456789",
      email: "nekaneks@gmail.com",
      role: "Student",
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    });

    await Student.create({
      users_id: neka._id,
      college_id: coll2._id,
      department_id: dept2._id,
      student_number: "20233300888",
    });

    console.log("Default data seeded successfully!");
  } catch (error) {
    console.error("Error seeding default student:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

Seed();
