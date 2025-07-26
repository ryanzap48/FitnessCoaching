const mongoose = require('mongoose');

const Exercise = new mongoose.Schema({
    name: String,
    description: String,
    categories: [String],
    equipment: [String],
    imageUrl: String,
    diagramUrl: String,
    videoUrl: String,
    instructions: [String],
}, { timestamps: true });

module.exports = mongoose.model('Exercise', Exercise);
