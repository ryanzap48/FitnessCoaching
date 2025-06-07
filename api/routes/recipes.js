const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// create recipe and assign to multipe user (can assign to no users)
router.post('/create', async (req, res) => {
    const {
        name,
        description,
        calories,
        protein,
        carbs,
        fats,
        category,
        foodClass,
        estimatedTime,
        servings,
        ingredients,
        instructions,
        imageUrl,
        userEmails = [], // Default to empty array if not provided
    } = req.body;


     let assignedTo = [];

    if (userEmails.length > 0) {
        const users = await User.find({ email: { $in: userEmails } });
        assignedTo = users.map((u) => u._id);
    }

    const newRecipe = new Recipe({
        name,
        description,
        calories,
        protein,
        carbs,
        fats,
        category,
        foodClass,
        estimatedTime,
        servings,
        ingredients,
        instructions,
        imageUrl,
        assignedTo, // will be empty if no users found
    });


    await newRecipe.save();
    res.status(201).json({ recipe: newRecipe });
});

// get recipes assigned ot logged-in user
router.get('/my', authenticateToken, async (req, res) => {
    const recipes = await Recipe.find( {assignedTo: req.user.id});
    res.json(recipes);
})


// get all recipes (admin view)
router.get('/', async (req, res) => {
    const recipes = await Recipe.find()
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 });
    res.json(recipes);
});

// delete a recipe
router.delete('/:id', async (req, res) => {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe Deleted'})
});

// get specific recipe
router.get('/:id', authenticateToken, async (req, res) => {
    const recipe = await Recipe.findById( req.params.id )
        .populate('assignedTo', 'firstName lastName email');
    res.json(recipe);    
});

// add additional users to a recipe
router.patch('/:id/assign', async (req, res) => {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { assignedTo: user._id }},
        { new: true }   
    ).populate('assignedTo', 'firstName lastName email');

    res.json(recipe)
});

// remove a user to a recipe
router.patch('/:id/unassign', async (req, res) => {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    
    const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { $pull: { assignedTo: user._id }},
        { new: true }   
    ).populate('assignedTo', 'firstName lastName email');

    res.json(recipe)
});



module.exports = router;