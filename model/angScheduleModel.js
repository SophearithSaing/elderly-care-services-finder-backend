const mongoose = require('mongoose');

const angScheduleSchema = mongoose.Schema({
  date: {type: String},
  time: {type: String},
  name: {type: String},
  message: {type: String}
});

module.exports = mongoose.model('AngSchedule', angScheduleSchema);