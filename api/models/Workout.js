const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: String,
  sets: String,
  imageUrl: String,
  notes: String,
});

const BlockSchema = new mongoose.Schema({
  type: { type: String, enum: ['regular', 'superset'], default: 'regular' },
  exercises: [ExerciseSchema],
});

const Workout = new mongoose.Schema({
  title: String,
  duration: String,
  equipment: [String],
  blocks: [BlockSchema],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Workout', Workout);
