const mongoose = require("mongoose");
const Roles = require("../../Roles");

// Add the role-dependent fields, and specify the type of user model under the 'type' field.
// e.g. Counsellor, Client, Guest
const options = {
    discriminatorKey: "type"
}

// The default fields for every user, regardless of their type.
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: Number,
        default () {
            // Create the users role depending on the model type specified above.
            return Roles[this.type.toUpperCase()];
        }
    }
}, options);

userModel = mongoose.model("User", UserSchema);

module.exports = userModel;