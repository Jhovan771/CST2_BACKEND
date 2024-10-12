require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route handlers
app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/exercises", exerciseRoutes);

// Start server
app.listen(3001, () => {
  console.log("Server is running on Port 3001");
});
