const mongoose = require('mongoose');

const imagePathSchema = mongoose.Schema({
    email: {type: String},
    path: {type: String}
});

module.exports = mongoose.model('ImagePath', imagePathSchema);