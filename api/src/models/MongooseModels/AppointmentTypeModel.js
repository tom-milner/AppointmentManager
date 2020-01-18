const mongoose = require("mongoose");
let Schema = mongoose.Schema;

// The appointment type fields.
let appointmentTypeSchema = new Schema({

    // The name of the appointment type.
    name: {
        type: String,
        required: true,
        maxlength: 20,
    },

    // The duration of the appointment type in minutes.
    duration: {
        type: Number,
        required: true,
        max: 120,
        min: 50
    },

    // Whether the appointment type is recurring or not.
    isRecurring: {
        type: Boolean,
        default: false
    },

    // The number of recurring appointments in the series.
    recurringDuration: {
        type: Number,
        // only required if isRecurring is true
        required: this.isRecurring,
        default: 0,
        max: 10
    },

    // A description of the appointment type.
    description: {
        type: String,
        maxlength: 200
    },

    // The color to display the appointment type as on the client app.
    color: {
        type: String,
        // #xxxxxx  
        min: 7,
        max: 7,
        default: "#3398d3" // Default application theme color.
    }
});
// Export the appointment model.
module.exports = mongoose.model("AppointmentType", appointmentTypeSchema);