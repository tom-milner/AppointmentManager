const mongoose = require("mongoose");


const passwordResetSchema = new mongoose.Schema({

    // The hash of the password reset token. 
    // The token itself isn't stored so that if an attacker gains access to the database they won't be able to use any existing passwortd refresh tokens.
    hash: {
        type: String,
        required: true
    },

    // The time to expire the password refresh.
    expires: {
        type: Date,
    },

    // The user that was sent the password refresh.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        // This is unique so that a user can't have two active password resets at a time.
        unique: true
    }
});

// Expire the password reset 0 seconds after the current data equals the 'expires' field.
passwordResetSchema.index({
    expires: 1
}, {
    expireAfterSeconds: 0
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);