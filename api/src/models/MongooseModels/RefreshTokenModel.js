const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        default: function () {
            let now = Date.now();
            // expire one week from now.
            return new Date(now + 6.048e+8);
        }
    },
});

// set an index to expire the refresh token.
refreshTokenSchema.index({
    expires: 1
}, {
    expireAfterSeconds: 0
});

module.exports = mongoose.model("RefreshTokenModel", refreshTokenSchema);