const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Role = require("./Role");

const counsellorSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: Number,
    default: Role.Counsellor
  }
})
UserModel.discriminator("CounsellorModel", counsellorSchema);


module.exports = mongoose.model("CounsellorModel", counsellorSchema);