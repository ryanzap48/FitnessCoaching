const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema ({
    name: {type: String, required: true },
    description: {type: String, required: function() { return !this.isDraft; } },
    calories: {type: Number, required: function() { return !this.isDraft; } },
    protein: {type: Number, required: function() { return !this.isDraft; } },
    carbs: {type: Number, required: function() { return !this.isDraft; } },
    fats: {type: Number, required: function() { return !this.isDraft; } },
    category: {type: String, required: function() { return !this.isDraft; }},
    foodClass: {type: [String], required: function() { return !this.isDraft; }},
    estimatedTime: {type: String, required: function() { return !this.isDraft; }, default: ''},
    servings: {type: String, required: function() { return !this.isDraft; }, default: ''},
    ingredients: {type: [String], required: function() { return !this.isDraft; }},
    instructions: {type: [String], required: function() { return !this.isDraft; }},
    isDraft: {type: Boolean, default: false},
    imageUrl: String,
    
}, { timestamps: true });



module.exports = mongoose.model('Recipe', recipeSchema);