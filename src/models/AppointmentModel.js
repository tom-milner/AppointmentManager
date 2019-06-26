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
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
});


module.exports = mongoose.model("AppointmentModel", appointmentSchema);