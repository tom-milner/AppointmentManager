const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointmentTypeSchema = new Schema({
  title: {
    type: String,
    require: true,
  },

  duration: {
    type: Number,
    required: true
  }

})

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);