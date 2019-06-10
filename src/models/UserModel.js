const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for salting and hashing

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
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
  }
});

userModel = mongoose.model("UserModel", UserSchema);


module.exports = userModel;