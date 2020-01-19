const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  dailyCare: {type: Array},
  specialCare: {type: Array}
});

module.exports = mongoose.model('Service', serviceSchema)
