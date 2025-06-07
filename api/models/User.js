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
  weight:        { type: Number }, // in kg
  targetWeight:  { type: Number },
  experience:    { type: String },
  exercise:      { type: Number }, // sessions/week
  targetExercise:{ type: Number },
  equipment:     { type: String },
  coachStyle:    { type: String },
  fitnessGoals:  [{ type: String }],
},
{ timestamps: true });

module.exports = mongoose.model('User', userSchema);