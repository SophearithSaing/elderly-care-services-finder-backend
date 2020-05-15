const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
  caregiverName: {type: String},
  caregiverEmail: {type: String},
  caregiverPhoneNumber: {type: String},
  caregiverAge: {type: Number},
  elderName: {type: String},
  elderEmail: {type: String},
  elderPhoneNumber: {type: String},
  elderAge: {type: Number},
  startDate: {type: Date},
  stopDate: {type: Date},
  requireInterview: {type: Boolean},
  status: {type: Boolean},
  rejectionReason: {type: String},
  dateSent: {type: Date},
  selectedServices: {type: Object},
  selectedDP: {type: Number},
  selectedMP: {type: Number}
});

module.exports = mongoose.model('Request', requestSchema);
