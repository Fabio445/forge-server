const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const User = require("../models/user"); // User model

const { body, validationResult } = require("express-validator"); // For request validation

// Validation rules for user input
const validateUser = [
  body("username").isLength({ min: 1 }).withMessage("Username is required"),
  body("email").isEmail().withMessage("Email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 1 character"),
];

// Signup route
router.post("/signup", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }

  const { username, email, password } = req.body;

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername)
    return res.status(400).json({ message: "Username already in use" });

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail)
    return res.status(400).json({ message: "Email already in use" });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save new user
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  res.json({ message: "Signup successful" });
});

// Login route
router.post("/login", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return validation errors
  }

  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, userId: user._id }); // Return token and user ID
});

module.exports = router;
