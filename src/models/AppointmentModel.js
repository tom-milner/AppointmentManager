const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// define schema
let appointmentSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        require: true,
        max: 100
    }
});


module.exports = mongoose.model("AppointmentModel", appointmentSchema);