var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const Admin = require('../models/Admin');


const SECRET_KEY = 'mySecretKey'; // In production, store in .env


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