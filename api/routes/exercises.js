const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose');


router.post('/create', async (req, res) => {
    const { 
        name, 
        description, 
        categories, 
        imageUrl,
        diagramUrl,
        videoUrl,
        instructions, 
        notes,
    } = req.body;

    const newExercise = new Exercise({
        name, 
        description, 
        categories, 
        imageUrl,
        diagramUrl, 
        videoUrl,
        instructions, 
    });

    await newExercise.save();
    res.status(201).json({ exercise: newExercise });
});

router.get('/', async (req, res) => {
    const exercises = await Exercise.find()
        .sort({ updatedAt: -1 });
    res.json(exercises);
});

router.delete('/:id', async (req, res) => {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exercise Deleted'})
});

router.get('/:id', authenticateToken, async (req, res) => {
    const exercise = await Exercise.findById( req.params.id )
    res.json(exercise);    
});

router.post('/by-ids', async (req, res) => {
    const { ids } = req.body;
    const exercises = await Exercise.find({ _id: { $in: ids } });
    res.json(exercises);
});

// validate exercise names and return their IDs or not found names
router.post('/validate-names', async (req, res) => {
    const { names } = req.body; // array of exercise names to validate

    // find exercises whose name matches any in the names array (case-insensitive)
    const foundExercises = await Exercise.find({
        name: { $in: names.map(n => new RegExp(`^${n.trim()}$`, 'i')) }
    });

    const foundNames = foundExercises.map(e => e.name.toLowerCase());
    const notFoundNames = names.filter(
        n => !foundNames.includes(n.trim().toLowerCase())
    );

    res.json({
        foundExercises: foundExercises.map(e => ({
            id: e._id,
            name: e.name,
            categories: e.categories,
            diagram: e.diagram,
        })),
        notFoundNames,
    });
});

module.exports = router;