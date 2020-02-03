const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Roles = require("../../Roles");

// Guests don't have access to anything - they are only created when someone makes a one off appointment without registering an account.

// Guest Schema
const guestSchema = new mongoose.Schema({
  timeCreated: {
    type: Date,
    default: Date.now()
  }
});

// GuestModel extends UserModel
UserModel.discriminator("Guest", guestSchema);

// export guest.
module.exports = mongoose.model("Guest", guestSchema);
