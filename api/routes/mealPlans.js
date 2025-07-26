const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Helper function to populate all recipe references
const populateRecipes = (query) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    days.forEach(day => {
        mealTypes.forEach(mealType => {
            query.populate(`week.${day}.${mealType}`)
            
        });
    });
    
    return query.populate('assignedTo', 'firstName lastName email');
};

// Create meal plan
router.post('/create', async (req, res) => {
    try {
        const { 
            name, 
            week, 
            calories, 
            proteinPercent, 
            carbPercent,
            fatPercent,
            duration, 
            imageUrl,
            isDraft,
            userEmails = [], 
        } = req.body;

        let assignedTo = [];
        if (userEmails.length > 0) {
            const users = await User.find({ email: { $in: userEmails } });
            assignedTo = users.map((u) => u._id);
        }

        const newMealPlan = new MealPlan({
            name,
            week,
            calories,
            proteinPercent,
            carbPercent,
            fatPercent,
            duration,
            imageUrl,
            isDraft,
            assignedTo,
        });

        await newMealPlan.save();
        
        // Return populated meal plan
        const populatedMealPlan = await populateRecipes(
            MealPlan.findById(newMealPlan._id)
        );
        
        res.status(201).json({ mealPlan: populatedMealPlan });
    } catch (err) {
        console.error('Error creating meal plan:', err);
        res.status(500).json({ message: 'Error creating meal plan', error: err.message });
    }
});


// Get meal plans assigned to the logged-in user
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const mealPlans = await populateRecipes(
            MealPlan.find({ assignedTo: req.user.id })
        );
        res.json(mealPlans);
    } catch (err) {
        console.error('Error fetching user meal plans:', err);
        res.status(500).json({ message: 'Error fetching meal plans', error: err.message });
    }
});

// Get single meal plan by ID or slug
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        const isObjectId = mongoose.isValidObjectId(identifier);
        
        let query;
        if (isObjectId) {
            query = MealPlan.findById(identifier);
        } else {
            query = MealPlan.findOne({ slug: identifier });
        }

        const mealPlan = await populateRecipes(query);

        if (!mealPlan) {
            return res.status(404).json({ error: "Meal plan not found" });
        }

        res.json(mealPlan);
    } catch (err) {
        console.error('Error fetching meal plan:', err);
        res.status(500).json({ message: 'Error fetching meal plan', error: err.message });
    }
});

// Update meal plan
router.put('/:id', async (req, res) => {
    try {
        const { 
            name,
            week, 
            calories, 
            proteinPercent, 
            carbPercent,
            fatPercent,
            duration, 
            imageUrl,
            isDraft,
            userEmails = [],
        } = req.body;

        let assignedTo = [];
        if (userEmails.length > 0) {
            const users = await User.find({ email: { $in: userEmails } });
            assignedTo = users.map((u) => u._id);
        }

        const updateData = {
            week,
            calories,
            proteinPercent,
            carbPercent,
            fatPercent,
            duration,
            imageUrl,
            isDraft,
            assignedTo,
        };

        // Handle name and slug update
        if (name) {
            let slug = slugify(name, { lower: true, strict: true });
            let counter = 1;
            let existing;

            do {
                existing = await MealPlan.findOne({ 
                    slug,
                    _id: { $ne: req.params.id }
                });
                if (existing) {
                    slug = `${slug}-${counter}`;
                    counter++;
                }
            } while (existing);

            updateData.name = name;
            updateData.slug = slug;
        }

        const updated = await MealPlan.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Return populated meal plan
        const populatedMealPlan = await populateRecipes(
            MealPlan.findById(updated._id)
        );

        res.json({ mealPlan: populatedMealPlan });
    } catch (err) {
        console.error('Error updating meal plan:', err);
        res.status(500).json({ message: 'Error updating meal plan', error: err.message });
    }
});

// Get all meal plans (admin view)
router.get('/', async (req, res) => {
    try {
        const mealPlans = await MealPlan.find()
            .populate('assignedTo', 'firstName lastName email')
            .sort({ updatedAt: -1 });
        res.json(mealPlans);
    } catch (err) {
        console.error('Error fetching meal plans:', err);
        res.status(500).json({ message: 'Error fetching meal plans', error: err.message });
    }
});



// Convert to draft with assignment check
router.patch('/:id/convert-to-draft', async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);
        
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        if (mealPlan.assignedTo && mealPlan.assignedTo.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot convert to draft: Meal plan is assigned to clients' 
            });
        }

        const updated = await MealPlan.findByIdAndUpdate(
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

// Assign user to meal plan
router.patch('/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required' });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const mealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedTo: user._id } },
            { new: true }
        ).populate('assignedTo', 'firstName lastName email');

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        res.json(mealPlan);
    } catch (err) {
        console.error('Error assigning user:', err);
        res.status(500).json({ message: 'Error assigning user', error: err.message });
    }
});

// Unassign user from meal plan
router.patch('/:id/unassign', authenticateToken, async (req, res) => {
    try {
        const { userEmail } = req.body;
        
        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required' });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const mealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            { $pull: { assignedTo: user._id } },
            { new: true }
        ).populate('assignedTo', 'firstName lastName email');

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        res.json(mealPlan);
    } catch (err) {
        console.error('Error unassigning user:', err);
        res.status(500).json({ message: 'Error unassigning user', error: err.message });
    }
});

// Delete meal plan
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findByIdAndDelete(req.params.id);
        
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        res.json({ message: 'Meal plan deleted successfully' });
    } catch (err) {
        console.error('Error deleting meal plan:', err);
        res.status(500).json({ message: 'Error deleting meal plan', error: err.message });
    }
});


router.patch('/:id/add-recipe', authenticateToken, async (req, res) => {
    try {
        const { day, category, recipeId } = req.body;
        
        // Validate required fields (same as remove-recipe)
        if (!day || !category || !recipeId) {
            return res.status(400).json({ 
                message: 'Day, category, and recipeId are required' 
            });
        }

        // Validate day is valid (same as remove-recipe)
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(day.toLowerCase())) {
            return res.status(400).json({ 
                message: 'Invalid day' 
            });
        }

        // Validate category is valid (same as remove-recipe)
        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({ 
                message: 'Invalid category' 
            });
        }

        // Validate recipeId is a valid ObjectId
        if (!mongoose.isValidObjectId(recipeId)) {
            return res.status(400).json({ 
                message: 'Invalid recipe ID format' 
            });
        }

        // Find and update the meal plan
        const mealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            { 
                $addToSet: { 
                    [`week.${day}.${category}`]: recipeId 
                } 
            },
            { new: true }
        );

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Return the populated meal plan
        const populatedMealPlan = await populateRecipes(
            MealPlan.findById(mealPlan._id)
        );

        res.json(populatedMealPlan);
    } catch (err) {
        console.error('Error adding recipe:', err);
        res.status(500).json({ 
            message: 'Error adding recipe to meal plan', 
            error: err.message 
        });
    }
});


// Add this route to your mealplans.js router file
router.patch('/:id/remove-recipe', authenticateToken, async (req, res) => {
    try {
        const { day, category, recipeId } = req.body;
        
        // Validate required fields
        if (!day || !category || !recipeId) {
            return res.status(400).json({ 
                message: 'Day, category, and recipeId are required' 
            });
        }

        // Validate day is valid
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(day.toLowerCase())) {
            return res.status(400).json({ 
                message: 'Invalid day. Must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday' 
            });
        }

        // Validate category is valid
        const validCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({ 
                message: 'Invalid category. Must be one of: breakfast, lunch, dinner, snack' 
            });
        }

        // Validate recipeId is a valid ObjectId
        if (!mongoose.isValidObjectId(recipeId)) {
            return res.status(400).json({ 
                message: 'Invalid recipe ID format' 
            });
        }

        // Find and update the meal plan
        const mealPlan = await MealPlan.findByIdAndUpdate(
            req.params.id,
            { 
                $pull: { 
                    [`week.${day}.${category}`]: recipeId 
                } 
            },
            { new: true }
        );

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Return the populated meal plan
        const populatedMealPlan = await populateRecipes(
            MealPlan.findById(mealPlan._id)
        );

        res.json(populatedMealPlan);
    } catch (err) {
        console.error('Error removing recipe:', err);
        res.status(500).json({ 
            message: 'Error removing recipe from meal plan', 
            error: err.message 
        });
    }
});



module.exports = router;