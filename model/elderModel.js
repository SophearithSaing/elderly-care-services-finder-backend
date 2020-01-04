const mongoose = require('mongoose');

const elderSchema = mongoose.Schema({
  name: {type: String},
  email: {type: String},
  password: {type: String},
  birthDate: {type: Date},
  gender: {type: String},
  houseNumber: {type: String},
  street: {type: String},
  subDistrict: {type: String},
  district: {type: String},
  province: {type: String},
  postalCode: {type: String},
  phoneNumber: {type: String},
  imagePath: {type: String}
});

module.exports = mongoose.model('Elder', elderSchema);
