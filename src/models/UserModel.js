const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for salting and hashing

const Role = require("./Role");

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
  },
  role: {
    type: Number,
    default: Role.User
  }
});

userModel = mongoose.model("UserModel", UserSchema);


module.exports = userModel;