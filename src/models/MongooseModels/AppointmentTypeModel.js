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
    default: 0,
    max: 10
  },
  description: {
    type: String,
    maxlength: 200
  },
  color: {
    type: String,
    // #xxxxxx  
    min: 7,
    max: 7,
    default: "#3398d3"
  }
});

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);