const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Create a workout and assign to multiple users
router.post('/create', async (req, res) => {
  const { title, duration, equipment, blocks, userEmails=[] } = req.body;


  let assignedTo = []

  if (userEmails.length > 0) {
      const users = await User.find({ email: { $in: userEmails } });
      assignedTo = users.map((u) => u._id);
  }

  const newWorkout = new Workout({
    title,
    duration,
    equipment,
    blocks,
    assignedTo,
  });

  await newWorkout.save();
  res.status(201).json({ workout: newWorkout });
});

// Get workouts assigned to the logged-in user
router.get('/my', authenticateToken, async (req, res) => {
  const workouts = await Workout.find({ assignedTo: req.user.id });
  res.json(workouts);
});

// Get all workouts (admin view)
router.get('/', async (req, res) => {
  const workouts = await Workout.find()
    .populate('assignedTo', 'firstName lastName email');
  res.json(workouts);
});

// Delete a workout
router.delete('/:id', async (req, res) => {
  await Workout.findByIdAndDelete(req.params.id);
  res.json({ message: 'Workout deleted' });
});

// Get a specific workout
router.get('/:id', authenticateToken, async (req, res) => {
  const workout = await Workout.findById(req.params.id)
    .populate('assignedTo', 'firstName lastName email');
  res.json(workout);
});

// Assign additional users to a workout
router.patch('/:id/assign', async (req, res) => {
  const { userEmail } = req.body;
  const user = await User.findOne({ email: userEmail });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const workout = await Workout.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { assignedTo: user._id } },
    { new: true }
  ).populate('assignedTo', 'firstName lastName email');

  res.json(workout);
});

// Remove a user from a workout assignment
router.patch('/:id/unassign', async (req, res) => {
  const { userEmail } = req.body;
  const user = await User.findOne({ email: userEmail });

  const workout = await Workout.findByIdAndUpdate(
    req.params.id,
    { $pull: { assignedTo: user._id } },
    { new: true }
  ).populate('assignedTo', 'firstName lastName email');

  res.json(workout);
});

module.exports = router;
