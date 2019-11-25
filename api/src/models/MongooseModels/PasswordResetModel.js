const mongoose = require("mongoose");

// Counsellor Schema
const passwordResetSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }
});

passwordResetSchema.index({
    expires: 1
}, {
    expireAfterSeconds: 0
});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);