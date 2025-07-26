const mongoose = require('mongoose');
const slugify = require('slugify');

const daySchema = new mongoose.Schema({
    breakfast: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    lunch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    dinner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    snack: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
});

const weekSchema = new mongoose.Schema({
    monday: { type: daySchema, required: function() { return !this.isDraft; }, },
    tuesday: { type: daySchema, required: function() { return !this.isDraft; }, },
    wednesday: { type: daySchema, required: function() { return !this.isDraft; }, },
    thursday: { type: daySchema, required: function() { return !this.isDraft; }, },
    friday: { type: daySchema, required: function() { return !this.isDraft; }, },
    saturday: { type: daySchema, required: function() { return !this.isDraft; }, },
    sunday: { type: daySchema, required: function() { return !this.isDraft; }, },
    });

const mealPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true }, // Add this line
    week: { type: weekSchema, required: function() { return !this.isDraft; }, }, 
    calories: {type: Number, required: function() { return !this.isDraft; }, },
    proteinPercent: {type: Number, required: function() { return !this.isDraft; }, },
    carbPercent: {type: Number, required: function() { return !this.isDraft; }, },
    fatPercent: {type: Number, required: function() { return !this.isDraft; }, },
    duration: {type: String, required: function() { return !this.isDraft; },},
    imageUrl: {type: String},
    isDraft: {type: Boolean, default: false},
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

}, { timestamps: true });

mealPlanSchema.pre('save', async function(next) {
  if (!this.slug && this.name) {
    let slug = slugify(this.name, { lower: true, strict: true });
    let counter = 1;
    let existing;
    
    do {
      existing = await this.constructor.findOne({ slug });
      if (existing) {
        slug = `${slug}-${counter}`;
        counter++;
      }
    } while (existing);
    
    this.slug = slug;
  }
  next();
});


module.exports = mongoose.model('MealPlan', mealPlanSchema);
