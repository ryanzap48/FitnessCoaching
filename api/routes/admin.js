var express = require('express');
var router = express.Router();
const Admin = require('../models/Admin');


router.get('/', async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

// POST a new admin
router.post('/', async (req, res) => {
  const newAdmin = new Admin(req.body);
  console.log('Constructed Mongoose ADMIN:', newAdmin);
  await newAdmin.save();
  res.status(201).json(newAdmin);
});


module.exports = router;