require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Student = require("./models/Student");
const College = require("./models/College");
const Department = require("./models/Department");
const Organization = require("./models/Organization");
const Event = require("./models/Event"); 

async function Seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    await College.deleteMany({});
    await Department.deleteMany({});
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});

    // College
    const coll1 = await College.create({ college_code: "CITC", college_name: "College of Information Technology and Computing" });
    const coll2 = await College.create({ college_code: "CE", college_name: "College of Engineering" });

    // Department
    const dept1 = await Department.create({ college_id: coll1._id, department_code: "BSIT", department_name: "Bachelor of Science in Information Technology" });
    const dept2 = await Department.create({ college_id: coll2._id, department_code: "BSCE", department_name: "Computer Engineering" });

    // --- ORGANIZATIONS ---
    const org_jpice = await Organization.create({ 
        department_id: dept2._id, 
        org_name: "JPICE",
        org_type: "Department Organization",
        description: "Junior Philippine Institute of Computer Engineers",
        pfp: "https://example.com/jpice_logo.jpg",
        cover_photo: "https://example.com/jpice_cover.jpg",
        fb_link: "https://facebook.com/jpice.ustp",
        ig_link: "https://instagram.com/jpice.ustp",
        x_link: "https://twitter.com/jpice_ustp",
        moderator_name: "John Doe"
    });

    const org_site = await Organization.create({ 
        department_id: dept1._id, 
        org_name: "SITE",
        org_type: "Department Organization",
        description: "Society of Information Technology Enthusiasts",
        pfp: "https://example.com/jpice_logo.jpg",
        cover_photo: "https://example.com/jpice_cover.jpg",
        fb_link: "https://facebook.com/jpice.ustp",
        ig_link: "https://instagram.com/jpice.ustp",
        x_link: "https://twitter.com/jpice_ustp",
        moderator_name: "Angelo Binonggo"
    });


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

    //Rabi
    const hashedPassRabi = await bcrypt.hash("rabibaho", 10);
    const rabi = await User.create({
      user_id: nextUserId++,
      username: "rabi",
      password: hashedPassRabi,
      firstname: "Rabi",
      middlename: "Baho",
      lastname: "Rodriguez",
      contact_number: "09123456789",
      email: "rabi@gmail.com",
      role: "Student",
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    });

      await Student.create({
        users_id: rabi._id,
        college_id: coll2._id,
        department_id: dept2._id,
        student_number: "2023300151",
      });

    //Bonsel
    const hashedPassBonsel = await bcrypt.hash("shrek", 10);
    const bonsel = await User.create({
      user_id: nextUserId++,
      username: "Bons",
      password: hashedPassBonsel,
      firstname: "Vonzelle Fiona",
      middlename: "Aratan",
      lastname: "Puray",
      contact_number: "09123456789",
      email: "bonsel@gmail.com",
      role: "Committee",
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    });

    // --- EVENTS (Department + Organization Based) ---
    await Event.insertMany([
      {
        event_name: "Free Coffee & Pastry",
        organization_id: org_site._id,
        event_image: "https://example.com/coffee.jpg",
        event_type: "Seminar",
        description: "Start your morning the IT way!",
        event_date: new Date("2025-10-17"),
        start_time: new Date("2025-10-17T08:00:00"),
        end_time: new Date("2025-10-17T10:00:00"),
        venue: "Main Auditorium",
        status: "Upcoming",
        is_mandatory: false,
       
      },
      {
        event_name: "Aleba: The Future of Vrkan",
        event_image: "https://example.com/future_tech.jpg",
        event_type: "Training",
        description: "Discover the next wave of innovation.",
        event_date: new Date("2025-10-22"),
        start_time: new Date("2025-10-22T09:00:00"),
        end_time: new Date("2025-10-22T12:00:00"),
        venue: "Engineering Building",
        status: "Upcoming",
        is_mandatory: true,
        organization_id: org_jpice._id
      },
    ]);

    console.log("Default data + organizations + events seeded successfully!");
  } catch (error) {
    console.error("Error seeding default student:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

Seed();
