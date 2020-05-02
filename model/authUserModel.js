const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const authUserSchema = mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

authUserSchema.plugin(uniqueValidator);

authUserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// module.exports = mongoose.model("AuthUser", authUserSchema);
const AuthUser = mongoose.model('AuthUser', authUserSchema);

module.exports = AuthUser;
