const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppointmentTypeSchema = require("./AppointmentTypeModel").schema;

// define schema
let appointmentSchema = new Schema({

    title: {
        type: String,
        require: true,
        max: 100
    },

    // save the appointment type directly in the schema so that if appointment types are updated, the appointment specific info will be left unchanged.
    appointmentType: AppointmentTypeSchema,

    counsellorId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // clients that booked the appointment
    clients: [{
        type: Schema.Types.ObjectId,
        ref: "User"
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
        required: function () {
            return this.appointmentType.isRecurring
        }
    },
    recurringNo: {
        type: Number,
        default: 0,
        required: function () {
            return this.appointmentType.isRecurring
        }
    }
});

module.exports = mongoose.model("Appointment", appointmentSchema);