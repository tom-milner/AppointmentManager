const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let appointmentTypeSchema = new Schema({
  name: {
    type: String,
    require: true,
  },

  duration: {
    type: Number,
    required: true
  }

})

module.exports = mongoose.model("AppointmentTypeModel", appointmentTypeSchema);