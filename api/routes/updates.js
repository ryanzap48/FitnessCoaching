const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const authenticateToken = require('../middleware/authenticateToken');

// POST /updates - create a new update
router.post('/', async (req, res) => {
  try {
    const { userId, type, message, data } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: "userId, type, and message are required" });
    }

    const newUpdate = new Update({
      userId,
      type,
      message,
      data
    });

    await newUpdate.save();

    res.status(201).json(newUpdate);
  } catch (err) {
    console.error("Error creating update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/my', authenticateToken, async (req, res) => {
  try {
    const updates = await Update.find({ userId: req.user.id })
      .populate('userId', 'firstName lastName email') // only fetch these fields
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;