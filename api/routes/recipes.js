const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
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
        isDraft,
        imageUrl,
    } = req.body;

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
        isDraft,
        imageUrl,
    });
    await newRecipe.save();
    res.status(201).json({ recipe: newRecipe });
});


// Update recipe
router.put('/:id', async (req, res) => {
    try {
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
            isDraft,
            imageUrl,
        } = req.body;


        const updateData = {
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
            isDraft,
            imageUrl,
        };

        const updated = await Recipe.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        
        res.json(updated);
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(500).json({ message: 'Error updating recipe', error: err.message });
    }
});


router.get('/', async (req, res) => {
    const recipes = await Recipe.find()
        .sort({ updatedAt: -1 });
    res.json(recipes);
});

// Convert to draft with assignment check
router.patch('/:id/convert-to-draft', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const updated = await Recipe.findByIdAndUpdate(
            req.params.id,
            { isDraft: true },
            { new: true }
        );
        
        res.json(updated);
    } catch (err) {
        console.error('Error converting to draft:', err);
        res.status(500).json({ message: 'Error converting to draft', error: err.message });
    }
});


// delete a recipe
router.delete('/:id', async (req, res) => {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe Deleted'})
});

// get specific recipe
router.get('/:id', authenticateToken, async (req, res) => {
    const recipe = await Recipe.findById( req.params.id )
    res.json(recipe);    
});

router.post('/by-ids', async (req, res) => {
    const { ids } = req.body;
    const recipes = await Recipe.find({ _id: { $in: ids } });
    res.json(recipes);
});

// validate recipe names and return their IDs or not found names
router.post('/validate-names', async (req, res) => {
    const { names } = req.body; // array of recipe names to validate


    // Find recipes whose name matches any in the names array (case-insensitive)
    const foundRecipes = await Recipe.find({
        name: { $in: names.map(n => new RegExp(`^${n.trim()}$`, 'i')) }
    });

    const foundNames = foundRecipes.map(r => r.name.toLowerCase());
    const notFoundNames = names.filter(
        n => !foundNames.includes(n.trim().toLowerCase())
    );

    res.json({
        foundRecipes: foundRecipes.map(r => ({
            id: r._id,
            name: r.name,
            calories: r.calories,
            protein: r.protein,
            carbs: r.carbs,
            fats: r.fats,
            imageUrl: r.imageUrl,
        })),
        notFoundNames,
    });
});

module.exports = router;
