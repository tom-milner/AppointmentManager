const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

// Give client a token for validation in other parts of the API
function jwtSignUser(user) {
  const oneDay = 60 * 60 * 24 * 7;
  // Create token
  var token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: oneDay
  });
  return token;
}

// sign up a new user
async function register(req, res) {
  // create user
  let newUser = new UserModel({
    email: req.body.email,
    username: req.body.username
  });


  // Hash password and store in database.

  // Generate salt. saltRounds is the cost factor of hashing algorithm.
  // For example, a saltRounds of 10 will mean that the bcrypt calculation is performed 2^10 (1024) times.
  // The higher the saltRounds, the longer the salt takes to generate, but the more secure the hash.
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  const hash = await bcrypt.hash(req.body.password, salt);
  console.log(hash);
  if (hash == null) {
    res.json({
      error: "Error adding user."
    });
  }
  // Store hash in user object, ready to be saved.
  newUser.password = hash;

  // Save user to database
  newUser.save(function (err, newUser) {
    if (err) {
      let errorMessage;
      switch (err.code) {
        case 11000:
          errorMessage = "User already exists.";
          break;
        default:
          errorMessage = "Error creating user.";
          break;
      }
      console.log(err);
      res.status(400).send({
        error: errorMessage
      });
      return;
    }
    // Return newly created user 
    res.send({
      success: true,
      message: "User added.",
      user: {
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        id: newUser._id
      },
      // Sign user with new token
      token: jwtSignUser(newUser.toJSON())
    });
  });
}

// Login the client and provide them with an access token
async function login(req, res) {
  try {
    const {
      inputUsername,
      password
    } = req.body;

    // Find matching users in database
    const userMatches = await UserModel.find({
      username: inputUsername
    });

    // Only 1 user should be found - use 0th term just in case
    const user = userMatches[0];

    // Check user could be found
    if (!user) {
      return res.status(403).send({
        error: "Incorrect login information."
      });
    }

    // Hash password and check against hash in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).send({
        error: "Incorrect password."
      });
    }

    let {
      email,
      _id
    } = user;

    // return user with new access token.
    res.send({
      user: {
        username,
        email,
        _id
      },
      token: jwtSignUser(user.toJSON())
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      error: "An error has occured."
    });
  }
}

module.exports = {
  register,
  login
};