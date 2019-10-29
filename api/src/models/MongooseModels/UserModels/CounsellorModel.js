const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Role = require("../../Role.js");

// Counsellor Schema
const counsellorSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: Number,
        default: Role.Counsellor
    },
    appointmentBufferTime: {
        type: Number,
        default: 10
    },
    workingDays: {
        type: [{
            name: {
                type: String,
                required: true
            },
            startTime: {
                type: String,
                default: "09:00",
                required: true
            },
            endTime: {
                type: String,
                required: true,
                default: "17:00"
            }
        }, ],
        default: [],
        validate: [workDayLimit, "{PATH} exceeds limit of 7 work days."]
    }
});

function workDayLimit(days) {
    return days.length <= 7;
}
UserModel.discriminator("Counsellor", counsellorSchema);

module.exports = mongoose.model("Counsellor", counsellorSchema);