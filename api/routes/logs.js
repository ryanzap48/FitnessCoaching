const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Workout = require('../models/Workout');



// POST create or update workout log
router.post('/', async (req, res) => {
  try {
    const { workoutId, scheduledDate, exercises, notes, totalDuration } = req.body;
    const userId = req.user.id;
    
    // Check if log already exists
    let log = await Log.findOne({
      user: userId,
      workout: workoutId,
      scheduledDate: new Date(scheduledDate)
    });
    
    const workout = await Workout.findById(workoutId);
    
    if (log) {
      // Update existing log
      log.exercises = exercises;
      log.notes = notes || '';
      log.totalDuration = totalDuration;
      log.completed = exercises.every(ex => ex.completed);
      log.loggedDate = new Date();
    } else {
      // Create new log
      log = new Log({
        user: userId,
        workout: workoutId,
        workoutTitle: workout.title,
        scheduledDate: new Date(scheduledDate),
        exercises,
        notes: notes || '',
        totalDuration,
        completed: exercises.every(ex => ex.completed)
      });
    }
    
    await log.save();
    res.status(201).json(log);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user's workout logs
router.get('/user', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const query = { user: userId };
    
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await Log.find(query)
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('workout');
    
    const total = await Log.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;