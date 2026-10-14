
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

// REGISTER A NEW USER
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long."
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, 'student')`,
      [cleanName, cleanEmail, hashedPassword]
    );

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: result.insertId,
        fullName: cleanName,
        email: cleanEmail,
        role: "student"
      }
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Unable to create your account."
    });
  }
});

// LOG IN AN EXISTING USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [users] = await db.execute(
      "SELECT id, full_name, email, password, role FROM users WHERE email = ?",
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET === "replace_with_a_long_random_secret") {
      return res.status(500).json({
        message: "The server authentication secret needs configuration."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Unable to log in."
    });
  }
});

module.exports = router;
