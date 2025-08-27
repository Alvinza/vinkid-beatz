// routes/beatRoutes.js
const express = require("express");
const router = express.Router();
const Beat = require("../models/Beat");
const { verifyAdmin } = require("../middleware/authMiddleware");

// ========================
// Get all beats
// ========================
router.get("/", async (req, res) => {
  try {
    const beats = await Beat.find();
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch beats" });
  }
});

// ========================
// Search beats by title or genre
// ========================
router.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    const beats = await Beat.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
    });
    res.json(beats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching beats" });
  }
});

// ========================
// Fetch beats by specific genre
// ========================
router.get("/genre/:genre", async (req, res) => {
  try {
    const genre = req.params.genre;
    const beats = await Beat.find({ genre });
    res.json(beats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch beats by genre" });
  }
});

// ========================
// Update beat (admin-only)
// ========================
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const beatId = req.params.id;
    const updateData = req.body;

    const updatedBeat = await Beat.findByIdAndUpdate(beatId, updateData, {
      new: true,
    });

    if (!updatedBeat) {
      return res.status(404).json({ error: "Beat not found" });
    }

    res.json(updatedBeat);
  } catch (err) {
    res.status(500).json({ error: "Failed to update beat" });
  }
});

// ========================
// Delete beat (admin-only)
// ========================
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const beatId = req.params.id;
    const beat = await Beat.findById(beatId);

    if (!beat) {
      return res.status(404).json({ error: "Beat not found" });
    }

    // Just delete from DB (files are hosted on Cloudinary)
    await Beat.findByIdAndDelete(beatId);

    res.json({ message: "Beat deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete beat" });
  }
});

// ========================
// Upload new beat (admin-only)
// ========================
router.post("/upload", verifyAdmin, async (req, res) => {
  try {
    const { title, bpm, price, genre, picture, audio } = req.body;

    // Validate required fields
    if (!title || !bpm || !price || !genre) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Ensure both Cloudinary URLs are present
    if (!picture || !audio) {
      return res
        .status(400)
        .json({ error: "Both picture and audio files are required!" });
    }

    // Create new beat document
    const newBeat = new Beat({
      title,
      picture, // Cloudinary image URL
      audio,   // Cloudinary audio URL
      bpm: Number(bpm),
      price: Number(price),
      genre,
    });

    await newBeat.save();

    res.status(201).json({
      message: "Beat uploaded successfully!",
      beat: newBeat,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      error: "Failed to upload beat",
      details: err.message,
    });
  }
});

module.exports = router;
