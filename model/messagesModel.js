const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
  elder: {type: String},
  caregiver: {type: String},
  messages: {type: Array}
});

module.exports = mongoose.model('Messages', messagesSchema);
