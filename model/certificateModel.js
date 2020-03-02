const mongoose = require('mongoose');

const certificatePathSchema = mongoose.Schema({
    email: {type: String},
    path: {type: String}
});

module.exports = mongoose.model('CertificatePath', certificatePathSchema);