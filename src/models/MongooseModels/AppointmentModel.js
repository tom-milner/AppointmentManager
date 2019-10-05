const mongoose = require("mongoose");
const Schema = mongoose.Schema;




// define schema
let appointmentSchema = new Schema({

  title: {
    type: String,
    require: true,
    max: 100
  },

  appointmentType: {
    type: Schema.Types.ObjectId,
    ref: "AppointmentTypeModel"
  },

  counsellorId: {
    type: Schema.Types.ObjectId,
    ref: "UserModel"
  },
  // clients that booked the appointment
  clients: [{
    type: Schema.Types.ObjectId,
    ref: "UserModel"
  }],
  // client notes about appointment
  clientNotes: {
    type: String
  },
  // counsellor notes about appointment
  counsellorNotes: {
    type: String,
    select: false
  },
  // location of appointment

  // allocated time for appointment
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  // whether the apointment has been confirmed or not
  isApproved: {
    type: Boolean,
    required: true,
    default: false
  },
  clientCanAttend: {
    type: Boolean,
    default: true
  },
  recurringSeriesId: {
    type: Schema.Types.ObjectId,
    required: this.isRecurring
  },
  recurringNo: {
    type: Number,
    default: 0,
    required: this.isRecurring
  },
});

module.exports = mongoose.model("AppointmentModel", appointmentSchema);