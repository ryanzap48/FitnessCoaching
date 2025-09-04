const mongoose = require('mongoose');


const updateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['body_metric', 'progress_photo', 'log', 'pr'] },
  message: { type: String }, // human-readable message like "You added a new weight log"
  data: { type: Object },    // extra details if needed
 
},
{ timestamps: true });


module.exports = mongoose.model('Update', updateSchema);