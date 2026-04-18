const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ── Helper: generate JWT ──────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
 * Returns: { user, token }
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if email already in use
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user (password is hashed by pre-save hook in User model)
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        interests: user.interests,
        skillLevel: user.skillLevel,
        goal:      user.goal,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { user, token }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user (explicitly select password which is excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:        user._id,
        name:      user.name,
        email:     user.email,
        interests: user.interests,
        skillLevel: user.skillLevel,
        goal:      user.goal,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

/**
 * GET /api/auth/me
 * Protected — requires Bearer token
 * Returns the currently logged-in user's info
 */
router.get("/me", protect, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id:        req.user._id,
        name:      req.user.name,
        email:     req.user.email,
        interests: req.user.interests,
        skillLevel: req.user.skillLevel,
        goal:      req.user.goal,
        extractedSkills: req.user.extractedSkills,
        resumeParsedData: req.user.resumeParsedData,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/auth/interests
 * Protected — update user's selected interests + skillLevel
 * Body: { interests: [], skillLevel: "" }
 */
router.put("/interests", protect, async (req, res) => {
  try {
    const { interests, skillLevel } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests, skillLevel },
      { new: true }
    );

    res.status(200).json({
      message: "Interests updated",
      user: {
        id:        user._id,
        interests: user.interests,
        skillLevel: user.skillLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
