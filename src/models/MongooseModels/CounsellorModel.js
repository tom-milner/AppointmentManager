const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Role = require("../Role.js");


// Counsellor Schema
const counsellorSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: Number,
    default: Role.Counsellor
  },
  workingDays: {
    type: [{
      name: String,
      startTime: Date,
      endTime: Date
    }],
    validate: [workDayLimit, "{PATH} exceeds limit of 7 work days."]
  }
})

function workDayLimit(days) {
  return days.length <= 7;
}

UserModel.discriminator("CounsellorModel", counsellorSchema);


module.exports = mongoose.model("CounsellorModel", counsellorSchema);