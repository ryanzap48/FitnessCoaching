var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Update = require('../models/Update');
const authenticateToken = require('../middleware/authenticateToken');


const multer = require('multer');
const sharp = require('sharp');
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

const storageProgress = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/progress-pictures')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const uploadProgress = multer({ storage: storageProgress });


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
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      age,
      gender,
      height,
      weight, // expects an array of numbers e.g., [43]
      targetWeight,
      experience,
      exercise,
      targetExercise,
      equipment,
      coachStyle,
      fitnessGoals,
    } = req.body;

    const now = new Date();

    const weightObjects = weight.map(w => ({ value: w, date: now }));
    const currentWeight = weightObjects[weightObjects.length - 1].value;

    const heightM = height / 100;
    const bmiObjects = weightObjects.map(wObj => ({
      value: +(wObj.value / (heightM * heightM)).toFixed(2),
      date: wObj.date,
    }));

    let bmr;
    if (gender.toLowerCase() === "male") {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }

    let activityMultiplier = 1.2; // default sedentary
    if (exercise <= 1) activityMultiplier = 1.2;
    else if (exercise <= 3) activityMultiplier = 1.375;
    else if (exercise <= 5) activityMultiplier = 1.55;
    else if (exercise <= 7) activityMultiplier = 1.725;
    else activityMultiplier = 1.9;

    const caloriesObjects = weightObjects.map(wObj => ({
      value: Math.round(bmr * activityMultiplier),
      date: wObj.date,
    }));

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      age,
      gender,
      height,
      weight: weightObjects,
      bmi: bmiObjects,
      mCalories: caloriesObjects,
      targetWeight,
      experience,
      exercise,
      targetExercise,
      equipment,
      coachStyle,
      fitnessGoals,
    });

    await newUser.save();
    res.status(201).json(newUser);

  } catch (err) {
    console.error(err);
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ error: "Email is already taken" });
    }
    res.status(400).json({ error: err.message });
  }
});


router.post('/add-metrics', authenticateToken, async (req, res) => {
  try {
    const { weight, sleep } = req.body;

    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();

    // Append new weight entry and recalc BMI + mCalories
    if (weight !== undefined && weight !== null) {
      user.weight = user.weight || [];
      user.weight.push({ value: weight, date: now });

      // Recalculate BMI
      if (user.height) {
        const heightM = user.height / 100; // cm → meters
        const bmi = +(weight / (heightM * heightM)).toFixed(2);
        user.bmi = user.bmi || [];
        user.bmi.push({ value: bmi, date: now });
      }

      // Recalculate maintenance calories
      let bmr;
      if (user.gender.toLowerCase() === "male") {
        bmr = 10 * weight + 6.25 * user.height - 5 * user.age + 5;
      } else if (user.gender.toLowerCase() === "female" || user.gender.toLowerCase() === "prefer not to say" || user.gender.toLowerCase() === "other") {
        bmr = 10 * weight + 6.25 * user.height - 5 * user.age - 161;
      }

      // Determine activity multiplier based on exercise level
      let activityMultiplier = 1.2; // sedentary default
      if (user.exercise <= 1) activityMultiplier = 1.2;
      else if (user.exercise <= 3) activityMultiplier = 1.375;
      else if (user.exercise <= 5) activityMultiplier = 1.55;
      else if (user.exercise <= 7) activityMultiplier = 1.725;
      else activityMultiplier = 1.9;

      const calcCalories = Math.round(bmr * activityMultiplier);

      user.mCalories = user.mCalories || [];
      user.mCalories.push({ value: calcCalories, date: now });
    }

    // Append new sleep entry
    if (sleep !== undefined && sleep !== null) {
      user.sleep = user.sleep || [];
      user.sleep.push({ value: sleep, date: now });
    }

    await user.save();

    await Update.create({
      userId: req.user.id,
      type: 'body_metric',
      message: 'Updated body metrics',
      data: { weight, sleep }
    });

    res.status(200).json({ message: 'Metrics added', user });
  } catch (err) {
    console.error('Error adding metrics:', err);
    res.status(500).json({ message: 'Server error' });
  }
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

      // Delete old profile picture if it exists
      const processedFilename = Date.now() + ".jpg";
      const processedPath = path.join(__dirname, "../uploads/profile-pictures", processedFilename);
      await sharp(req.file.path)
        .resize(500, 500, { fit: "cover" }) // resize to 500x500
        .jpeg({ quality: 80 })              // compress
        .toFile(processedPath);

      fs.unlinkSync(req.file.path);

      // Save new file URL
      updateData.profilePicture = `/uploads/profile-pictures/${processedFilename}`;
    }

    // Update user with new info
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    await Update.create({
      userId: req.params.id,
      type: 'profile_picture',
      message: 'Updated profile picture',
      data: { profilePicture: updateData.profilePicture }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/progress-picture', uploadProgress.single('progressPicture'), async (req, res) => {
  console.log(req.file)
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      const newPath = `/uploads/progress-pictures/${req.file.filename}`;

      // Ensure progressPictures is an array
      if (!Array.isArray(user.progressPictures)) {
        user.progressPictures = [];
      }

      // Add new picture path to array
      user.progressPictures.push(newPath);
      await user.save();

      await Update.create({
        userId: req.params.id,
        type: 'progress_photo',
        message: 'Added a new progress picture',
        data: { progressPicture: newPath }
      });
    }

    res.json(user);
  } catch (err) {
    console.error('Error adding progress picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
});







module.exports = router;