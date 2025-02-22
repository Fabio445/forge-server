const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = require("../middlewares/auth");
const {
  validationResult,
  validateUser,
  validateLogin,
} = require("../middlewares/validation");

// Signup route
router.post("/signup", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  // Check if username or email already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername)
    return res
      .status(400)
      .json({ message: "Username or Email already in use" });

  const existingEmail = await User.findOne({ email });
  if (existingEmail)
    return res
      .status(400)
      .json({ message: "Username or Email already in use" });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create and save new user
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  // Generate JWT token
  const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "Signup successful", token, userId: newUser.id });
});

// Login route
router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  // Check if user exists by username or email
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, userId: user.id });
});

// Update user
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Ensure user can only update their own account
    if (req.params.id !== req.user.userId) {
      return res.status(403).json({
        message: "Unauthorized: You dont have the right permissions",
      });
    }

    const { username, email, password } = req.body;

    // Check if username or email are already in use
    if (username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existingUsername) {
        return res
          .status(400)
          .json({ message: "Username or Email already in use" });
      }
    }

    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "Username or Email already in use" });
      }
    }

    // Hash new password if provided
    let updatedFields = { username, email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// Get all users (for testing only)
router.get("/get", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
