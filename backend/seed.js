require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./models/User");
const Student = require("./models/Student");
const College = require("./models/College");
const Department = require("./models/Department");
const Organization = require("./models/Organization");
const Event = require("./models/Event");

/* ======================================
      SEED FUNCTIONS (MODULAR)
====================================== */

// ⭐ SEED COLLEGES
async function seedColleges() {
  const colleges = [
    {
      college_code: "CITC",
      college_name: "College of Information Technology and Computing",
    },
    {
      college_code: "CE",
      college_name: "College of Engineering",
    },
  ];

  for (const col of colleges) {
    await College.findOneAndUpdate(
      { college_code: col.college_code },
      col,
      { upsert: true, new: true }
    );
  }

  console.log("✔ Colleges seeded");
}

// ⭐ SEED DEPARTMENTS
async function seedDepartments() {
  const coll1 = await College.findOne({ college_code: "CITC" });
  const coll2 = await College.findOne({ college_code: "CE" });

  const departments = [
    {
      college_id: coll1._id,
      department_code: "BSIT",
      department_name: "Bachelor of Science in Information Technology",
    },
    {
      college_id: coll2._id,
      department_code: "BSCE",
      department_name: "Computer Engineering",
    },
  ];

  for (const dep of departments) {
    await Department.findOneAndUpdate(
      { department_code: dep.department_code },
      dep,
      { upsert: true, new: true }
    );
  }

  console.log("✔ Departments seeded");
}

// ⭐ SEED ORGANIZATIONS
async function seedOrganizations() {
  const dept1 = await Department.findOne({ department_code: "BSIT" });
  const dept2 = await Department.findOne({ department_code: "BSCE" });

  const organizations = [
    {
      department_id: dept2._id,
      org_name: "JPICE",
      org_type: "Department Organization",
      description: "Junior Philippine Institute of Computer Engineers",
      pfp: "https://example.com/jpice_logo.jpg",
      cover_photo: "",
      fb_link: "https://facebook.com/jpice.ustp",
      ig_link: "https://instagram.com/jpice.ustp",
      x_link: "https://twitter.com/jpice_ustp",
      moderator_name: "John Doe",
    },
    {
      department_id: dept1._id,
      org_name: "SITE",
      org_type: "Department Organization",
      description:
        "SITE empowers future IT professionals through innovation, leadership, and collaboration.",
      pfp: "https://example.com/jpice_logo.jpg",
      cover_photo: "https://example.com/jpice_cover.jpg",
      fb_link: "https://facebook.com/jpice.ustp",
      ig_link: "https://instagram.com/jpice.ustp",
      x_link: "https://twitter.com/jpice_ustp",
      moderator_name: "Angelo Binonggo",
    },
  ];

  for (const org of organizations) {
    await Organization.findOneAndUpdate(
      { org_name: org.org_name },
      org,
      { upsert: true, new: true }
    );
  }

  console.log("✔ Organizations seeded");
}

// ⭐ SEED EVENTS
async function seedEvents() {
  const org_site = await Organization.findOne({ org_name: "SITE" });
  const org_jpice = await Organization.findOne({ org_name: "JPICE" });

  const events = [
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
      event_name: "Aleba: The Future of Vrkan",
      organization_id: org_jpice._id,
      event_image: "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/coffee_and_pastry.png?raw=true",
      event_type: "Training",
      description: "Discover the next wave of innovation.",
      event_date: new Date("2025-12-30"),
      start_time: new Date("2025-12-30T09:00:00"),
      end_time: new Date("2025-12-30T12:00:00"),
      venue: "Engineering Building",
      status: "Upcoming",
      is_mandatory: true,
    },
    {
      event_name: "Lycanfest 2025",
      organization_id: org_site._id,
      event_image: "https://res.cloudinary.com/dhfgfpoav/image/upload/v1763983155/crtcg1_uohxoo.png",
      event_type: "General Assembly",
      description: "Howling into the future of tech.",
      event_date: new Date("2025-12-30"),
      start_time: new Date("2025-12-30T09:00:00"),
      end_time: new Date("2025-12-30T12:00:00"),
      venue: "Campus Grounds",
      status: "Upcoming",
      is_mandatory: true,
    },
  ];

  for (const ev of events) {
    await Event.findOneAndUpdate(
      { event_name: ev.event_name },
      ev,
      { upsert: true, new: true }
    );
  }

  console.log("✔ Events seeded");
}

// ⭐ SEED USERS + STUDENTS ONLY IF NONE EXIST
async function seedUsersAndStudents() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log("⚠ Users already exist. Skipping user + student seeding.");
    return;
  }

  console.log("🌱 Seeding users & students...");

  const coll1 = await College.findOne({ college_code: "CITC" });
  const coll2 = await College.findOne({ college_code: "CE" });
  const dept1 = await Department.findOne({ department_code: "BSIT" });
  const dept2 = await Department.findOne({ department_code: "BSCE" });

  let nextUserId = 1;

  const users = [
    {
      username: "sabrinaaryan",
      password: "12345",
      firstname: "Sabrina",
      middlename: "Grande",
      lastname: "Aryan",
      email: "sabrina@gmail.com",
      role: "Student",
      student_number: "20233300120",
      college_id: coll1._id,
      department_id: dept1._id,
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/sabrina_profile.jpg?raw=true",
    },
    {
      username: "nekaneks",
      password: "nekaneks",
      firstname: "Nikka",
      middlename: "Sabrina",
      lastname: "Rodriguez",
      email: "nekaneks@gmail.com",
      role: "Student",
      student_number: "2023300204",
      college_id: coll2._id,
      department_id: dept2._id,
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    },
    {
      username: "rabi",
      password: "rabibaho",
      firstname: "Rabi",
      middlename: "Baho",
      lastname: "Rodriguez",
      email: "rabi@gmail.com",
      role: "Student",
      student_number: "20233300123",
      college_id: coll2._id,
      department_id: dept2._id,
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    },
    {
      username: "Bons",
      password: "shrek",
      firstname: "Vonzelle Fiona",
      middlename: "Aratan",
      lastname: "Puray",
      email: "bonsel@gmail.com",
      role: "Committee",
      student_number: "2023300151",
      college_id: coll2._id,
      department_id: dept2._id,
      profile_image:
        "https://github.com/austindatan/MARQUE-USTP-Event-Attendance-Monitoring-System/blob/main/mobile/assets/images/neka_profile.jpg?raw=true",
    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);

    const newUser = await User.create({
      user_id: nextUserId++,
      username: u.username,
      password: hash,
      firstname: u.firstname,
      middlename: u.middlename,
      lastname: u.lastname,
      contact_number: "09123456789",
      email: u.email,
      role: u.role,
      profile_image: u.profile_image,
    });

    await Student.create({
      users_id: newUser._id,
      student_number: u.student_number,
      college_id: u.college_id,
      department_id: u.department_id,
    });
  }

  console.log("✔ Users & students seeded");
}



/* ======================================
                MAIN
====================================== */

async function Seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");

    await seedColleges();
    await seedDepartments();
    await seedOrganizations();
    await seedEvents();
    await seedUsersAndStudents();

    console.log("🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

Seed();
