const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
  caregiverName: {type: String},
  caregiverEmail: {type: String},
  elderName: {type: String},
  elderEmail: {type: String},
  startDate: {type: Date},
  stopDate: {type: Date},
  requireInterview: {type: Boolean},
  status: {type: Boolean},
  rejectionReason: {type: String}
});

module.exports = mongoose.model('Request', requestSchema);
