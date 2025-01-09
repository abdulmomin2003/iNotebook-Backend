const express = require("express");
const bcrypt = require("bcryptjs"); // Import bcryptjs
const jwt = require("jsonwebtoken"); // Import jsonwebtoken
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
require("dotenv").config({ path: ".env.local" });
const fetchUser = require("../middleware/fetchUser");

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT SECRET is not defined in .env.local");
}

console.log("JWT Secret:", jwtSecret); // Just for debugging, remove in production
// @route   GET /api/auth
// @desc    Test route
// @access  Public
router.get("/", (req, res) => {
  res.send("Welcome to the Auth API!");
});

// ROUTE 1: Create a user using POST "/api/auth/register", No Login Required
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("name", "Name must be at least 3 characters").isLength({ min: 3 }),
    body("username", "Username must be at least 3 characters").isLength({
      min: 3,
    }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "A user with this email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user
      const user = new User({
        name,
        username,
        email,
        password: hashedPassword, // Store the hashed password
      });

      // Save the user to the database
      await user.save();

      const data = {
        user: {
          id: user.id,
        },
      };

      // Generate JWT token
      const token = jwt.sign(data, jwtSecret, {
        expiresIn: "1h", // Token expiration time
      });

      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 2: Authenticate a user using POST "/api/auth/login", No Login Required
// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be empty").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      // Generate JWT token
      const token = jwt.sign(data, jwtSecret, {
        expiresIn: "1h", // Token expiration time
      });

      res.json({ message: "User logged in successfully", token });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ROUTE 3: Get Logged in User Details using POST "/api/auth/getuser", Login Required
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    // Fetch user details by ID
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
