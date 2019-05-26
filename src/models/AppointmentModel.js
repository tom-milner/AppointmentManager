const mongoose = require("mongoose")

const Schema = mongoose.Schema;

let AppointmentSchema = new Schema({
  millisFromEpoch: {
    type: Date,
    required: true
  },

})