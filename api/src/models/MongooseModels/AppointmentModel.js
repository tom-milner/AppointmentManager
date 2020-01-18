const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");

const AppointmentTypeSchema = require("./AppointmentTypeModel").schema;

// Fetch the global mailer instance.
const mailer = new Mailer();

// Define schema
let appointmentSchema = new Schema({
    title: {
        type: String,
        default: function () {
            // If no appointment title is specified, make the title of the appointment the name of the appointment type.
            return this.appointmentType.name;
        }
    },

    // Save the appointment type directly in the schema so that if appointment types are updated, the appointment specific info will be left unchanged.
    appointmentType: AppointmentTypeSchema,

    // The counsellor Id field stores an ObjectId pointing towards an item in the 'User' collection.
    counsellorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Clients that booked the appointment. The client's ids are stored in an array, and each ID points to a field in the 'Users' collection.
    // This is an array as I plan on adding support for appointments with multiple clients (This is an extension objective).
    clients: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],

    // Client notes about appointment
    clientNotes: {
        type: String
    },
    // Counsellor notes about appointment
    counsellorNotes: {
        type: String,
        select: false
    },
    // Allocated time for appointment.
    startTime: {
        type: Date,
        required: true
    },

    // The end time of the appointment.
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

    // Whether the client can attend the appointment or not.
    clientCanAttend: {
        type: Boolean,
        default: true
    },

    // The ID of the recurring appointment series.
    recurringSeriesId: {
        type: Schema.Types.ObjectId,
        required: function () {
            return this.appointmentType.isRecurring;
        }
    },

    // The number of the appointment in the recurring series.
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

    // Get the clients and counsellor information.
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
        // Add the counsellor and clients to the recipients list.
        recipients.push(...appointment.clients, appointment.counsellorId);


        // If the client status has changed, alert the counsellor.
    } else if (updatedFields.includes("clientCanAttend")) {
        recipients.push(appointment.counsellorId);

        // If the appointment approval status has changed, alert the client.
    } else if (updatedFields.includes("isApproved")) {
        recipients.push(...appointment.clients)
    }

    // If any recipients are specified, send an email.
    if (recipients.length > 0) {
        mailer.alertAppointmentChanged(appointment, updatedData, recipients).send();
    };
});

module.exports = mongoose.model("Appointment", appointmentSchema);