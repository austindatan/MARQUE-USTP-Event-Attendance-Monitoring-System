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

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("✅ Database already seeded. Skipping seed operation.");
      await mongoose.connection.close();
      return;
    }

    console.log("🌱 Database empty. Starting seed...");

    // College
    const coll1 = await College.create({ college_code: "CITC", college_name: "College of Information Technology and Computing" });
    const coll2 = await College.create({ college_code: "CE", college_name: "College of Engineering" });

    // Department
    const dept1 = await Department.create({ college_id: coll1._id, department_code: "BSIT", department_name: "Bachelor of Science in Information Technology" });
    const dept2 = await Department.create({ college_id: coll2._id, department_code: "BSCE", department_name: "Computer Engineering" });

    // Organizations
    const org_jpice = await Organization.create({ 
        department_id: dept2._id, 
        org_name: "JPICE",
        org_type: "Department Organization",
        description: "Junior Philippine Institute of Computer Engineers",
        pfp: "https://example.com/jpice_logo.jpg",
        cover_photo: "",
        fb_link: "https://facebook.com/jpice.ustp",
        ig_link: "https://instagram.com/jpice.ustp",
        x_link: "https://twitter.com/jpice_ustp",
        moderator_name: "John Doe"
    });

    const org_site = await Organization.create({ 
        department_id: dept1._id, 
        org_name: "SITE",
        org_type: "Department Organization",
        description: "SITE empowers future IT professionals through innovation, leadership, and collaboration. We are the official student organization of BSIT students at USTP, driven by passion for tech, committed to building a vibrant, skill-driven, inclusive IT community.",
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
      student_number: "2023300204",
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
        student_number: "20233300123",
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

    await Student.create({
        users_id: bonsel._id,
        college_id: coll2._id,
        department_id: dept2._id,
        student_number: "2023300151",
      });

    // Events
    await Event.insertMany([
      {
        event_name: "Free Coffee & Pastry",
        organization_id: org_site._id,
        event_image: "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/coffee_and_pastry.png?raw=true",
        event_type: "Seminar",
        description: "Start your morning the IT way!",
        event_date: new Date("2025-10-17"),
        start_time: new Date("2025-10-17T08:00:00"),
        end_time: new Date("2025-10-17T10:00:00"),
        venue: "Main Auditorium",
        status: "Concluded",
        is_mandatory: false,
       
      },
      {
        event_name: "Lycanfest 2025",
        event_image: "https://res.cloudinary.com/dhfgfpoav/image/upload/v1763983155/crtcg1_uohxoo.png",
        event_type: "General Assembly",
        description: "Howling into the future of tech.",
        event_date: new Date("2025-12-30"),
        start_time: new Date("2025-12-30T09:00:00"),
        end_time: new Date("2025-12-30T12:00:00"),
        venue: "Campus Grounds",
        status: "Upcoming",
        is_mandatory: true,
        organization_id: org_site._id
      },
    ]);

    console.log("✅ Default data + organizations + events seeded successfully!");
  } catch (error) {
    console.error("Error seeding default student:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

Seed();