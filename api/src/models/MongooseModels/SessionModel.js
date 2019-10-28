const mongoose = require("mongoose");
const Logger = require("../../struct/Logger")(module);


const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel"
    },
    refreshToken: {
        type: String,
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
    expires: {
        type: Date,
        // get expiry date from token.
        default: function () {
            let payload = this.refreshToken.split(".")[1];
            let buff = Buffer.from(payload, "base64");
            let decodedPayload = JSON.parse(buff.toString("ascii"));
            return decodedPayload.exp * 1000;
        }
    },
});

// set an index to expire the refresh token.
refreshTokenSchema.index({
    expires: 1
}, {
    expireAfterSeconds: 0
});

module.exports = mongoose.model("SessionModel", refreshTokenSchema);