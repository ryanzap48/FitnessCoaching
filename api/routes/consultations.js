// routes/consultations.js
const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');

router.post('/', async (req, res) => {
  const { firstName, phone, message } = req.body;

  if (!firstName || !phone) {
    return res.status(400).json({ message: 'First Name and phone are required' });
  }

  if (/\s/.test(firstName)) {
    return res.status(400).json({ message: 'First Name must not contain spaces' });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
  }

  try {
    const existing = await Consultation.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'You’ve already submitted a consultation request.' });
    }

    const newConsultation = new Consultation({ firstName, phone, message });
    console.log(newConsultation.message)
    await newConsultation.save();

    res.status(201).json({ message: 'Consultation submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ submittedAt: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
});

router.delete('/:id', async (req, res) => {
  await Consultation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Consultation deleted' });
});

module.exports = router;
