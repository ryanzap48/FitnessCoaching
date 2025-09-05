const mongoose = require('mongoose');

const SetLogSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  actualWeight: { type: Number, required: true },
  actualReps: { type: Number, required: true },
  completed: { type: Boolean, default: true },
}, { _id: false });

const ExerciseLogSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String, required: true }, // Store name for quick access
  desiredSets: { type: Number, required: true },
  desiredReps: { type: String, required: true },
  desiredWeight: { type: String, required: true },
  actualSets: [SetLogSchema],
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, { _id: false });

const LogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
  workoutTitle: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  loggedDate: { type: Date, default: Date.now },
  exercises: [ExerciseLogSchema],
  completed: { type: Boolean, default: false },
  totalDuration: { type: Number }, // in minutes
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);