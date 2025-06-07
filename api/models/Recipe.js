const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema ({
    name: {type: String, required: true },
    description: {type: String, required: true },
    calories: {type: Number, required: true },
    protein: {type: Number, required: true },
    carbs: {type: Number, required: true },
    fats: {type: Number, required: true },
    category: {type: String, required: true},
    foodClass: {type: [String], required: true},
    estimatedTime: {type: String, required: true, default: ''},
    servings: {type: String, required: true, default: ''},
    ingredients: {type: [String], required: true},
    instructions: {type: [String], required: true},
    imageUrl: String,
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });



module.exports = mongoose.model('Recipe', recipeSchema);