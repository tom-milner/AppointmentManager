const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointmentTypeSchema = new Schema({
  name: {
    type: String,
    require: true,
    unique: true,
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
  description: {
    type: String,
    maxlength: 200
  }
})

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);