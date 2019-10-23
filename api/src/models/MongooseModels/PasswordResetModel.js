const mongoose = require("mongoose");

// Counsellor Schema
const passwordResetSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        default: function () {
            let now = Date.now();
            // 2.628e+6 seconds: 1 month
            // 1800 seconds: 30 mins
            return new Date(now + ((this.isGuest ? 2.628e+6 : 1800) * 1000));
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
        unique: true
    },
    isGuest: {
        type: Boolean,
        required: false
    }
});

passwordResetSchema.index({
    expires: 1
}, {
    expireAfterSeconds: 0
});

module.exports = mongoose.model("PasswordResetModel", passwordResetSchema);