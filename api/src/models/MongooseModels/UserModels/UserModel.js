const mongoose = require("mongoose");
const Roles = require("../../Roles");

const options = {
    discriminatorKey: "type"
}

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
            return Roles[this.type.toUpperCase()];
        }
    }
}, options);

userModel = mongoose.model("User", UserSchema);


module.exports = userModel;