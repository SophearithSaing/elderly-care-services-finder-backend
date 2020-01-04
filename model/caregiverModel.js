const mongoose = require('mongoose');

const caregiverSchema = mongoose.Schema({
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
  services: {type: Array},
  certificate: {type: String},
  experience: {type: String},
  dailyPrice: {type: Number},
  monthlyPrice: {type: Number},
  imagePath: {type: String},
  schedule: {type: Array}
});

module.exports = mongoose.model('Caregiver', caregiverSchema)
