const mongoose = require('mongoose');

const rejectionSchema = mongoose.Schema({
  caregiverEmail: {type: String},
  caregiverName: {type: String},
  reason: {type: String}
})

module.exports = mongoose.model('Rejection', rejectionSchema);
