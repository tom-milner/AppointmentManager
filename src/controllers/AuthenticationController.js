const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CounsellorModel = require("../models/MongooseModels/CounsellorModel");
const ClientModel = require("../models/MongooseModels/ClientModel");
const UserModel = require("../models/MongooseModels/UserModel");
// Register a new counsellor
async function registerCounsellor(req, res) {

  try {

    let {
      email,
      username,
      firstname,
      lastname,
      password
    } = req.body;

    let newCounsellor = new CounsellorModel({
      email: email,
      username: username,
      firstname: firstname,
      lastname: lastname,
    });

    // hash password
    newCounsellor.password = await hashPassword(password);
    // save counsellor in database
    const savedCounsellor = await newCounsellor.save();
    savedCounsellor.password = undefined;
    res.status(200).send({
      success: true,
      message: "Counsellor created successfully.",
      counsellor: savedCounsellor,
      token: jwtSignUser(savedCounsellor.toJSON())
    });

  } catch (err) {
    let errorMessage = "Error registering counsellor.";
    let errorStatusCode = 500;
    if (err.code == 11000) {
      errorMessage = "Counsellor already exists.";
      errorStatusCode = 409;
    }
    console.log(err.message);
    res.status(errorStatusCode).send({
      success: false,
      message: errorMessage
    });
  }
}

// register a new client
async function registerClient(req, res) {
  try {
    // create client model
    let newClient = new ClientModel({
      email: req.body.email,
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });

    // store hashed password in user object.
    newClient.password = await hashPassword(req.body.password);

    // Save client to database
    const savedClient = await newClient.save();
    savedClient.password = undefined;
    // Return newly created client
    res.status(200).send({
      success: true,
      message: "Client added.",
      client: savedClient,
      // Sign user with new token
      token: jwtSignUser(savedClient.toJSON())
    });
  } catch (err) {
    let errorMessage = "Error registering client.";
    let errorStatusCode = 500;
    if (err.code == 11000) {
      errorMessage = "Client already exists.";
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

    // Find matching users in database
    const userMatches = await UserModel.find({
      username: req.body.username
    });

    // Only 1 user should be found - use 0th term just in case
    const matchingUser = userMatches[0];
    // Check user exists
    if (!matchingUser) {
      res.status(401).send({
        success: false,
        message: "Incorrect login information."
      });
      return;
    }

    // Hash password and check against hash in database
    const isPasswordValid = await bcrypt.compare(req.body.password, matchingUser.password);

    if (!isPasswordValid) {
      res.status(401).send({
        success: false,
        message: "Incorrect password."
      });
      return;
    }

    // make sure password hash isn't returned
    matchingUser.password = undefined;



    // return user with new access token.
    const token = await jwtSignUser(matchingUser);
    res.status(200).send({
      success: true,
      message: "User logged in",
      user: matchingUser,
      token: token
    });

    return;

  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      // Generic error message so as to not reveal too much about the login process.
      message: "An error has occured."
    });
  }
}

async function refreshToken(req, res) {
  try {
    // create new token
    const newToken = jwtSignUser(req.user);

    // return new token and original user
    res.status(200).send({
      token: newToken,
      user: req.user,
      message: "Token refreshed successfully.",
      success: true
    })
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "An error occured refreshing the token."
    });
  }
}

// helper functions - not exposed

// Give client a token for validation in other parts of the API
async function jwtSignUser(user) {
  const oneDay = 60 * 60 * 24;
  const expirationTime = oneDay;
  // make user a plain object
  user = JSON.parse(JSON.stringify(user));
  // Create token
  const token = await jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: expirationTime
  });
  return token;
}

// return a hashed password
async function hashPassword(password) {
  // First, generate salt. saltRounds is the cost factor of hashing algorithm.
  // For example, a saltRounds of 10 will mean that the bcrypt calculation is performed 2^10 (1024) times.
  // The higher the saltRounds, the longer the salt takes to generate, but the more secure the hash.
  const SALT_ROUNDS = 10;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}
module.exports = {
  registerClient,
  login,
  refreshToken,
  registerCounsellor
};