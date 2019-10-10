const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Role = require("../../Role");

// Guests don't have access to anything - they are only created when someone makes a one off appointment without registering an account.

// Guest Schema
const guestSchema = new mongoose.Schema({
  role: {
    type: Number,
    default: Role.Guest
  },
  timeCreated: {
    type: Date,
    default: Date.now()
  }
});

// GuestModel extends UserModel
UserModel.discriminator("GuestModel", guestSchema);

// export guest.
module.exports = mongoose.model("GuestModel", guestSchema);