const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointmentTypeSchema = new Schema({
  name: {
    type: String,
    require: true,
    maxlength: 20,
  },
  duration: {
    type: Number,
    required: true,
    max: 120,
    min: 5
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDuration: {
    type: Number,
    // only required if isRecurring is true
    required: this.isRecurring,
    default: 0
  },
  description: {
    type: String,
    maxlength: 200
  }
})

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);