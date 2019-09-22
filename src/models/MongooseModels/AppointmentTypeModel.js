const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointmentTypeSchema = new Schema({
  name: {
    type: String,
    require: true,
    unique: true
  },

  duration: {
    type: Number,
    required: true,
    max: 120,
    min: 5
  }

})

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);