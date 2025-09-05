const mongoose = require('mongoose');


const updateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['body_metric', 'progress_photo', 'profile_picture', 'log', 'pr'] },
  message: { type: String }, // human-readable message like "You added a new weight log"
  data: { type: Object },    // extra details if needed
},
{ timestamps: true });


module.exports = mongoose.model('Update', updateSchema);

