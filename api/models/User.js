const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String, required: true },
  password:  { type: String, required: true }, // You’ll hash this later

  age:           { type: Number, required: true },
  gender:        { type: String },
  height:        { type: Number }, // in cm
  weight:        { type: [Number], default: [] }, // in kg
  sleep:         { type: [Number], default: []},
  targetWeight:  { type: Number },
  experience:    { type: String },
  exercise:      { type: Number }, // sessions/week
  targetExercise:{ type: Number },
  equipment:     { type: String },
  coachStyle:    { type: String },
  fitnessGoals:  [{ type: String }],
  profilePicture: { type: String },
  profileColor: { type: String },
},
{ timestamps: true });

userSchema.pre('save', function (next) {
  // Set random color if not already set
  if (!this.profileColor) {
    this.profileColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
  }
  next();
});


module.exports = mongoose.model('User', userSchema);