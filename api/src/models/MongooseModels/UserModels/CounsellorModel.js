// This contains the mongoose model for counsellors.


const mongoose = require("mongoose");
const UserModel = require("./UserModel");

// Counsellor Schema
// These fields are specific to the counsellor user type.
const counsellorSchema = new mongoose.Schema({
  appointmentBufferTime: {
    type: Number,
    default: 10,
    min: 10,
    max: 30
  },
  workingDays: {
    type: [
      {
        name: {
          type: String,
          required: true
        },
        startTime: {
          type: String,
          default: "09:00",
          required: true
        },
        endTime: {
          type: String,
          required: true,
          default: "17:00"
        }
      }
    ],
    default: [],
    validate: [workDayLimit, "{PATH} exceeds limit of 7 work days."]
  }
});

// Make sure the work day field never contains more than items.
function workDayLimit(days) {
  return days.length <= 7;
}

// Make this model an extension of the user model.
UserModel.discriminator("Counsellor", counsellorSchema);

module.exports = mongoose.model("Counsellor", counsellorSchema);
