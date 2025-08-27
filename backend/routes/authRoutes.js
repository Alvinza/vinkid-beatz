const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// LOGIN route
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Special handling for admin login
    if (email === process.env.ADMIN_EMAIL) {
      const isEnvPasswordValid = password === process.env.ADMIN_PASSWORD;
      const isStoredPasswordValid = await bcrypt.compare(password, user.password);
      
      // Validate admin password
      if (!isEnvPasswordValid && !isStoredPasswordValid) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Ensure admin status
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    } else {
      // Regular user password validation
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user details and token
    res.status(200).json({
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Registration Route
router.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
