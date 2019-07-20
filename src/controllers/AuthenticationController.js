const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

// Give client a token for validation in other parts of the API
function jwtSignUser(user) {
  const oneDay = 60 * 60 * 24;
  const tenSeconds = 10;

  const tokenPayload = {
    username: user.username,
    email: user.email,
    role: user.role
  }
  // Create token
  var token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: tenSeconds
  });
  return token;
}

// sign up a new user
async function register(req, res) {
  try {
    let data = req.body;
    if (!data.email || !data.username || !data.firstname || !data.lastname || !data.password) {
      throw "All fields are required";
    }

    // create user
    let newUser = new UserModel({
      email: req.body.email,
      username: req.body.username
    });
    // Hash password and store in database.
    // First, generate salt. saltRounds is the cost factor of hashing algorithm.
    // For example, a saltRounds of 10 will mean that the bcrypt calculation is performed 2^10 (1024) times.
    // The higher the saltRounds, the longer the salt takes to generate, but the more secure the hash.
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hash = await bcrypt.hash(req.body.password, salt);

    // Store hash in user object, ready to be saved.
    newUser.password = hash;

    // Save user to database
    const savedUser = await newUser.save();

    // Return newly created user
    res.send({
      success: true,
      message: "User added.",
      user: {
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role,
        id: savedUser._id
      },
      // Sign user with new token
      token: jwtSignUser(savedUser.toJSON())
    });
  } catch (err) {
    let errorMessage = "Error registering user.";
    let errorStatusCode = 500;
    if (err.code == 11000) {
      errorMessage = "User already exists.";
      errorStatusCode = 409;
    }
    console.log(err.message);
    res.status(errorStatusCode).send({
      success: false,
      message: errorMessage
    });
  }
}

// Login the client and provide them with an access token
async function login(req, res) {
  try {
    const {
      username,
      password
    } = req.body;

    console.log(req.body);

    // Find matching users in database
    const userMatches = await UserModel.find({
      username: username
    });

    // Only 1 user should be found - use 0th term just in case
    const user = userMatches[0];
    // Check user exists
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Incorrect login information."
      });
    }


    // Hash password and check against hash in database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).send({
        success: false,
        message: "Incorrect password."
      });
      return;
    }

    let {
      email,
      _id
    } = user;


    console.log(user);

    // return user with new access token.
    res.send({
      success: true,
      message: "User logged in",
      user: {
        username,
        email,
        _id
      },
      token: jwtSignUser(user.toJSON())
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({
      success: false,
      // Generic error message so as to not revela too much about the login process.
      message: "An error has occured."
    });
  }
}

module.exports = {
  register,
  login
};