// This contains the mongoose model for clients.

const mongoose = require("mongoose");
const UserModel = require("./UserModel");

// Define the fields specific to the client user type.
const clientSchema = new mongoose.Schema({
  clinicalNotes: {
    type: String,
    select: false
  }
});

// Make this model an extension of the User model. This means it has all the same properties as the user model, but with the extra properties specified above.
UserModel.discriminator("Client", clientSchema);

// Export the model.
module.exports = mongoose.model("Client", clientSchema);
