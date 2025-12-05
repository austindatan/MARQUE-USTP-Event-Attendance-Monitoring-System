const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Base route
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// Auth route
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

// Student route
const studentRoutes = require("./routes/student");
app.use("/api/student", studentRoutes);

// Student Profile route
const studentProfileRoutes = require('./routes/studentProfileRoutes');
app.use('/api/student', studentProfileRoutes);

// Event route  
const eventRoutes = require("./routes/eventRoutes");
app.use("/events", eventRoutes);
app.use('/api', eventRoutes);

// Attendance route
const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

// Explore Organizations route
const exploreorgRoutes = require("./routes/exploreorgRoutes");
app.use("/exploreorgs", exploreorgRoutes);

// Followed Organizations route
const followedorgsRoutes = require('./routes/followedorgRoutes');
app.use('/api/followed-orgs', followedorgsRoutes);

// Bookmarks route
const bookmarksRoutes = require('./routes/bookmarksRoutes');
app.use('/api/bookmarks', bookmarksRoutes);

// Organization route
const organizationRoutes = require('./routes/organizationRoutes');
app.use('/api/organizations', organizationRoutes);

// User route
//const userRoutes = require("./routes/userRoutes"); 
//app.use("/api/users", userRoutes); 

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Feedback route
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api/feedback", feedbackRoutes);

// Org Officer route
const orgOfficerRoutes = require('./routes/orgOfficerRoutes');
app.use('/api/memberships', orgOfficerRoutes);

// Join request route
const joinRequestRoutes = require('./routes/joinRequestRoutes');
app.use('/api/join-request', joinRequestRoutes);


// DB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

