const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    refreshToken: {
        type: String,
        required: true
    },
    salt: {
        type: Buffer,
        required: true
    },
    clientIp: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        expires: "1w", // Expire the token in 1 week.
        default: Date.now()
    }
});

module.exports = mongoose.model("Session", refreshTokenSchema);