const mongoose = require('mongoose');

const caregiverSchema = mongoose.Schema({
  joinedDate: {type: Date},
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
  services: {type: Object},
  certificate: {type: String},
  experience: {type: Array},
  dailyPrice: {type: Number},
  monthlyPrice: {type: Number},
  imagePath: {type: String},
  schedule: {type: Array},
  approval: {type: Boolean}
});

module.exports = mongoose.model('Caregiver', caregiverSchema)
