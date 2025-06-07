const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  phone:     { type: String, required: true },
  message:   { type: String }, // optional message
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
