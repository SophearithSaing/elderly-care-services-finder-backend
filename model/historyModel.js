const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    caregiverName: {type: String},
    caregiverEmail: {type: String},
    elderName: {type: String},
    elderEmail: {type: String},
    startDate: {type: Date},
    stopDate: {type: Date},
    requireInterview: {type: Boolean},
    rating: {type: Number},
    review: {type: String},
    selectedServices: {type: Object},
    selectedDP: {type: Number},
    selectedMP: {type: Number}
});

module.exports = mongoose.model('History', historySchema);
