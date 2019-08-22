const mongoose = require("mongoose");

const Role = require("./Role");

const options = {
  discriminatorKey: "kind"
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
  },
  role: {
    type: Number,
    default: Role.Client
  }
}, options);

userModel = mongoose.model("UserModel", UserSchema);


module.exports = userModel;