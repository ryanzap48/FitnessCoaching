var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const authenticateToken = require('../middleware/authenticateToken');


const multer = require('multer');
const path = require('path');
const fs = require('fs');


const SECRET_KEY = 'mySecretKey'; // In production, store in .env


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/profile-pictures')); // save to backend/uploads/profile-pictures
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});
const upload = multer({ storage });


router.get('/', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

router.get('/me', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
})

router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});


// POST a new user
router.post('/', async (req, res) => {
  const newUser = new User(req.body);
  console.log('Constructed Mongoose user:', newUser);
  await newUser.save();
  res.status(201).json(newUser);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (admin) {
    if (admin.password !== password) { // Use bcrypt.compare() if hashed
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

  const token = jwt.sign(
    { id: admin._id, email: admin.email, role: 'admin'},
    SECRET_KEY,
    { expiresIn: '2h' }
  );

  return res.json({ token, user: { id: admin._id, email: admin.email, role: 'admin' } });
  }
      
  const user = await User.findOne({ email });
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, email: user.email, role: 'user' }, SECRET_KEY, { expiresIn: '2h' });

  res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName, role: 'user' } });
});

// PATCH user by ID (update firstName, lastName, email, etc.)


router.patch('/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    // Find the user first
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = { ...req.body };

    // If a new file is uploaded
    if (req.file) {
      // Delete old profile picture if it exists
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, `../${user.profilePicture}`);

        fs.unlink(oldPath, (err) => {
          if (err) {
            console.error("Failed to delete old profile picture:", err);
          } else {
            console.log("Old profile picture deleted:", oldPath);
          }
        });
      }

      // Save new file URL
      updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }

    // Update user with new info
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;