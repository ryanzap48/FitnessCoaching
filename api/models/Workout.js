const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  sets: String,
  reps: String,
  rest: String,
  notes: String,
});

const BlockSchema = new mongoose.Schema({
  scheduledDate: { 
    type: Date,
    required: true 
  },
  exercises: [ExerciseSchema],
});

const Workout = new mongoose.Schema({
  title: String,
  duration: String,
  blocks: [BlockSchema],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Workout', Workout);
