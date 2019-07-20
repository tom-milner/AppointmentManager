const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define schema
let appointmentSchema = new Schema({
    // date and time of appointment
    date: {
        type: Date,
        required: true
    },
    // title of appointment
    title: {
        type: String,
        require: true,
        max: 100
    },
    // client that bookec the appointment
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
});


module.exports = mongoose.model("AppointmentModel", appointmentSchema);