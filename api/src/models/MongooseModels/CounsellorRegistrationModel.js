const mongoose = require("mongoose");

// Counsellor Schema
const counsellorRegistrationModel = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // expire the document in one day
        expires: 86400,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});


module.exports = mongoose.model("CounsellorRegistrationModel", counsellorRegistrationModel);