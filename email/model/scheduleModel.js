const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
  caregiverEmail: {type: String, unique: true},
  availability: {type: Array}
});

module.exports = mongoose.model('Schedule', scheduleSchema);
