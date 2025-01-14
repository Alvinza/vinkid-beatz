const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

    res.json({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
