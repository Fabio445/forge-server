require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose"); // MongoDB ODM
const cors = require("cors"); // Enable CORS
const morgan = require("morgan"); // HTTP request logger

const authRoutes = require("./routes/authRoutes"); // Authentication routes
const taskRoutes = require("./routes/taskRoutes"); // Task routes

const app = express();
const PORT = process.env.PORT || 5000; // Set port from env or default to 5000

// Middleware (must be defined before routes)
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for all routes
app.use(morgan("dev")); // Log HTTP requests

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Connect to MongoDB using URI from .env
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes (defined after middleware)
app.use("/auth", authRoutes); // Authentication routes
app.use("/tasks", taskRoutes); // Task routes

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});