const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define schema
let appointmentSchema = new Schema({

    // title of appointment
    title: {
        type: String,
        require: true,
        max: 100
    },
    counsellorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // clients that booked the appointment
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    // location of appointment
    loc: {
        type: {
            type: String,
            // required: true
        },
        coordinates: {
            type: [Number], // MUST BE LONGITUDE, THEN LATITUDE
            // required: true,
        }
    },
    // allocated time for appointment
    startTime: {
        type: Date,
        required: true,
        unique: true
    },
    endTime: {
        type: Date,
        required: true,
        unique: true
    },
    // whether the apointment has been confirmed or not
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    }
});

// tie an index to the schema so that it can be used to search
appointmentSchema.index({
    "loc": "2dsphere"
});


module.exports = mongoose.model("AppointmentModel", appointmentSchema);