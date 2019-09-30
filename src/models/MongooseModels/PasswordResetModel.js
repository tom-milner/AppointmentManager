const mongoose = require("mongoose");

// Counsellor Schema
const passwordResetSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true
  },
});


module.exports = mongoose.model("PasswordResetModel", passwordResetSchema);