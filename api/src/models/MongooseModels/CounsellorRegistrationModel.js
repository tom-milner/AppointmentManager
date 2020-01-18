const mongoose = require("mongoose");

// Counsellor Schema
const counsellorRegistrationModel = new mongoose.Schema({

    // The hash of the registration token. 
    // A hash of the token is stored instead of the token itself so that if an attacker gains access to the database they won't be able to use any existing tokens.
    hash: {
        type: String,
        required: true,
    },

    // The time the counsellor registration was created at.
    createdAt: {
        type: Date,
        default: Date.now(),
        // Expire the document in one day.
        // This means that a new counsellor must create their account within a day of being sent the registration email (which is when the counsellor registration is created).
        expires: 86400,
        required: true
    },

    // The email that the client registration was sent to. This is used to verify that the person using the counsellor registration is the same person that was sent the email.
    email: {
        type: String,
        required: true,
        unique: true
    }
});


module.exports = mongoose.model("CounsellorRegistration", counsellorRegistrationModel);