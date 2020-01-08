const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const authUserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

authUserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("AuthUser", authUserSchema);
