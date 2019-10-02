const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const moment = require("moment");
const Config = require("../config/Config");
const Mailer = require("../config/Mailer");
const CounsellorModel = require("../models/MongooseModels/CounsellorModel");
const ClientModel = require("../models/MongooseModels/ClientModel");
const UserModel = require("../models/MongooseModels/UserModel");
const PasswordResetModel = require("../models/MongooseModels/PasswordResetModel");
const ErrorController = require("../controllers/ErrorController");

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

    ErrorController.sendError(res, errorMessage, errorStatusCode);

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

    ErrorController.sendError(res, errorMessage, errorStatusCode);
  }
}

// Login the client and provide them with an access token
async function login(req, res) {
  try {

    // Find matching users in database
    const userMatches = await UserModel.find({
      username: req.body.username
    }).select("+password");

    console.log(userMatches);

    // Only 1 user should be found - use 0th term just in case
    const matchingUser = userMatches[0];
    // Check user exists
    if (!matchingUser) {
      // user doesn't exist - send error
      ErrorController.sendError(res, "Incorrect login information", 401);
      return;
    }

    // Hash password and check against hash in database
    const isPasswordValid = await bcrypt.compare(req.body.password, matchingUser.password);

    if (!isPasswordValid) {
      // Invalid password - send error.
      ErrorController.sendError(res, "Incorrect password.", 401);
      return;
    }

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
    // Generic error message so as to not reveal too much about the login process.
    ErrorController.sendError(res, "An error has occured", 500);
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
    ErrorController.sendError(res, "An error occured refreshing the token", 500);
  }
}


async function forgotPassword(req, res) {

  // get the email from the request body and search for the user associated with it.
  let email = req.body.email;
  try {
    let foundUser = await UserModel.findOne({
      email: email
    });

    if (!foundUser) throw {
      message: "There is no user with that email",
      code: 200
    }

    // get ip address of request.
    let requestIp = req.header('x-forwarded-for') || req.connection.remoteAddress;

    // create random token
    let token = await generatePasswordResetToken();

    // create a hash of the token to store in a database.
    let tokenHash = generateTokenHash(token);

    // store hash and timestamp in the database.
    let passwordReset = new PasswordResetModel({
      hash: tokenHash,
      timestamp: Date.now(),
      userId: foundUser._id
    });
    passwordReset.save(); // we don't need the passwordResetModel any more, so we don't need to await this.
    // send email
    const msg = {
      to: email,
      from: Config.mailer.email,
      subject: 'Forgotten Password',
      html: `<p>Hi ${foundUser.firstname}.</p>
            <p>We see you've forgotten your password.</p> 
            <p>Please follow this link to reset your password:</p>
            <a href="${Config.url}auth/reset-password?token=${token}">Reset Password</a> 
            <p>Ip: ${requestIp}</p>
            `
    };
    await Mailer.send(msg)
    // let the user know the email was sent.
    res.status(200).send({
      success: true,
      message: "Email sent sucessfully"
    });
  } catch (error) {
    console.log(error);
    ErrorController.sendError(res, error.message || "Error finding user associated with that email", error.code || 400);
  }

}

async function resetPassword(req, res) {
  let token = req.body.token;
  let password = req.body.password;

  // create token hash
  let tokenHash = generateTokenHash(token);
  try {
    // use hash as id to find relevant password reset in db.
    let foundPasswordReset = await PasswordResetModel.findOne({
      hash: tokenHash
    });
    if (!foundPasswordReset) throw {
      message: "Invalid token",
      code: 400
    }
    // users only have 30 mins to reset password.
    let tokenExpiryTime = 30;
    let tokenExpires = moment(foundPasswordReset.timestamp).add(tokenExpiryTime, "minutes");

    // check if the token has expired.
    if (moment().isAfter(tokenExpires)) {
      // remove the password reset from the db - we don't need to await this.
      await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);
      throw {
        message: "Token has expired.",
        code: 410
      }
    }

    // Token is valid!! reset the users password.
    let newPassword = await hashPassword(password);
    let updatedUser = await UserModel.findByIdAndUpdate(foundPasswordReset.userId, {
      password: newPassword
    });
    // remove the password reset from the db - we don't need to await this.
    await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
      updatedUser: updatedUser
    });

  } catch (error) {
    ErrorController.sendError(res, error.message || "Error resetting password", error.code || 500);
  }

}
// #############################
//      HELPER FUNCTIONS
// #############################

// Give client a token for validation in other parts of the API
async function jwtSignUser(user) {
  const oneDay = 60 * 60 * 24;
  const expirationTime = oneDay;
  // make user a plain object
  user = {
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
    _id: user._id
  };

  // Create token
  const token = await jwt.sign(user, Config.jwtSecret, {
    expiresIn: expirationTime
  });
  return token;
}

// return a hashed password
async function hashPassword(password) {
  // First, generate salt. saltRounds is the cost factor of hashing algorithm.
  // For example, a saltRounds of 10 will mean that the bcrypt calculation is performed 2^10 (1024) times.
  // The higher the saltRounds, the longer the salt takes to generate, but the more secure the hash.

  // I use bcrypt here as it is more secure than crypto (the inbuilt cryptography library).
  const SALT_ROUNDS = 10;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

function generateTokenHash(token) {
  let tokenHash = crypto.createHash("sha256");
  tokenHash.update(token);
  return tokenHashDigest = (tokenHash.digest("hex"));

}

// generate a password reset token
function generatePasswordResetToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, function (error, buffer) {
      if (error) reject(error);
      let token = buffer.toString("hex");
      console.log(token.length);
      resolve(token);
    })
  })
}

module.exports = {
  registerClient,
  login,
  refreshToken,
  registerCounsellor,
  forgotPassword,
  resetPassword
};