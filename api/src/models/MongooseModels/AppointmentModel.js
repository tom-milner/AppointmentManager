const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");

const AppointmentTypeSchema = require("./AppointmentTypeModel").schema;

const mailer = new Mailer();

// define schema
let appointmentSchema = new Schema({
    title: {
        type: String,
        default: function () {
            return this.appointmentType.name;
        }
    },

    // save the appointment type directly in the schema so that if appointment types are updated, the appointment specific info will be left unchanged.
    appointmentType: AppointmentTypeSchema,

    counsellorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // clients that booked the appointment
    // This is an array as I plan on adding support for appointments with multiple clients (This is an extension objective)
    clients: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
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
        default: function () {
            return moment(this.startTime).add(this.appointmentType.duration, "minutes");
        }
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
            return this.appointmentType.isRecurring;
        }
    },
    recurringNo: {
        type: Number,
        default: 0
    }
});

// Any time an appointment is updated, the clients and counsellors will be sent an email reminder.
// /update/gi is regex for any update query including "update" (case-insenstitive)
appointmentSchema.post(/update/gi, async function (appointment) {
    let updatedData = this._update;
    let updatedFields = Object.keys(updatedData.$set);

    // get the clients and counsellors emails.
    await appointment
        .populate("clients")
        .populate("counsellorId")
        .execPopulate();

    let recipients = [];

    // If the appointment times have changed, alert both the client and counsellor.
    if (updatedFields.includes("startTime") || updatedFields.includes("endTime")) {
        // format the dates.
        updatedData.startTime = moment(updatedData.startTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        updatedData.endTime = moment(updatedData.endTime).format("dddd, MMMM Do YYYY, h:mm:ss a");
        recipients.push(...appointment.clients);
        recipients.push(appointment.counsellorId);
    }

    // If the client status has changed, alert the counsellor.
    if (updatedFields.includes("clientCanAttend")) recipients.push(appointment.counsellorId);

    // If the appointment approval status has changed, alert the client.
    if (updatedFields.includes("isApproved")) recipients.push(...appointment.clients);

    // Send the email
    if (recipients.length > 0) mailer.alertAppointmentChanged(appointment, updatedData, recipients).send();
});

module.exports = mongoose.model("Appointment", appointmentSchema);