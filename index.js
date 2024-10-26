require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route handlers
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/uploads", uploadRoutes);

// Start server
app.listen(3001, () => {
  console.log("Server is running on Port 3001");
});
