const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ── WebSocket (ws) ────────────────────────────────────────────────────────
const wsServer = new WebSocketServer({ server, path: "/gate-ws" });
const { setWSServer } = require("./socket");
setWSServer(wsServer);

wsServer.on("connection", (socket) => {
  socket.subscriptions = new Set();
  console.log("[WS] Client connected");

  socket.on("message", (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    } catch (error) {
      console.warn("[WS] Ignored invalid JSON payload");
      return;
    }

    if (message.type === "subscribe" && message.eventId) {
      socket.subscriptions.add(String(message.eventId));
      console.log(`[WS] Client subscribed to event:${message.eventId}`);
      return;
    }

    if (message.type === "unsubscribe" && message.eventId) {
      socket.subscriptions.delete(String(message.eventId));
      console.log(`[WS] Client unsubscribed from event:${message.eventId}`);
    }
  });

  socket.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});
// ──────────────────────────────────────────────────────────────────────────

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
app.use("/api/user", studentRoutes)

// Student Profile route
const studentProfileRoutes = require('./routes/studentProfileRoutes');
app.use('/api/student', studentProfileRoutes);

// Event route  
const eventRoutes = require("./routes/eventRoutes");
app.use("/events", eventRoutes);

// Attendance route
const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

// Explore Organizations route
const exploreorgRoutes = require("./routes/exploreorgRoutes");
app.use("/exploreorgs", exploreorgRoutes);

// Followed Organizations route
const followedorgsRoutes = require('./routes/followedorgRoutes');
app.use('/api/followed-orgs', followedorgsRoutes);

// Organization route
const organizationRoutes = require('./routes/organizationRoutes');
app.use('/api/organizations', organizationRoutes);

// User route
//const userRoutes = require("./routes/userRoutes"); 
//app.use("/api/users", userRoutes); 

// Feedback route
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api/feedback", feedbackRoutes);

// Org Officer route
const orgOfficerRoutes = require('./routes/orgOfficerRoutes');
app.use('/api/memberships', orgOfficerRoutes);

// Bookmark
const bookmarkRoutes = require('./routes/bookmarkRoutes');
app.use("/api/bookmarks", bookmarkRoutes);

// Report route
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Notification route
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Department route
const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api', departmentRoutes);

// College route
const collegeRoutes = require("./routes/collegeRoutes");
app.use("/api", collegeRoutes);

// ML / Forecasting route
const mlRoutes = require('./routes/mlRoutes');
app.use('/api/ml', mlRoutes);

// DB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB is connected");
    // Start Scheduler
    const initScheduler = require('./scheduler/notificationScheduler');
    initScheduler();
  })
  .catch((err) => console.error("MongoDB connection error:", err));


// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize WebSocket
  const { initWebSocket } = require('./websocket');
  initWebSocket(server);
});

