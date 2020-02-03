const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  // The user using the session.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // The session's refresh token.
  refreshToken: {
    type: String,
    required: true
  },

  // The salt that the refresh token was created with.
  salt: {
    type: Buffer,
    required: true
  },

  // The IP address of the device that the session was created for.
  clientIp: {
    type: String,
    required: true
  },

  // The user agent of the device that the session was created for.
  userAgent: {
    type: String,
    required: true
  },

  // The time that the session was created.
  createdAt: {
    type: Date,
    expires: "1w", // Expire the token in 1 week.
    default: Date.now()
  }
});

module.exports = mongoose.model("Session", sessionSchema);
