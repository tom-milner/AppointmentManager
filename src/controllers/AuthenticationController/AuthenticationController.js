const bcrypt = require("bcrypt");
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");
const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const AuthenticationControllerHelpers = require("./AuthenticationControllerHelpers");
const Role = require("../../models/Role");
const Utils = require("../../utils/Utils");
const AppResponse = require("../../struct/AppResponse");

// Register a new counsellor
async function registerCounsellor(req, res) {
  const response = new AppResponse(res);

  try {
    let { email, username, firstname, lastname, password } = req.body;

    let newCounsellor = new CounsellorModel({
      email: email,
      username: username,
      firstname: firstname,
      lastname: lastname
    });

    // hash password
    newCounsellor.password = await AuthenticationControllerHelpers.hashPassword(
      password
    );
    // save counsellor in database
    const savedCounsellor = await newCounsellor.save();
    savedCounsellor.password = undefined;

    return response.success("Counsellor created successfully.", {
      user: savedCounsellor,
      token: AuthenticationControllerHelpers.jwtSignUser(
        savedCounsellor.toJSON()
      )
    });
  } catch (err) {
    let errorMessage = "Error registering counsellor.";
    let errorStatusCode = 500;
    if (err.code == 11000) {
      errorMessage =
        Utils.getDuplicateMongoEntryKey(err.message) + " already exists.";
      errorStatusCode = 409;
    }
    return response.failure(errorMessage, errorStatusCode);
  }
}

// register a new client
async function registerClient(req, res) {
  const response = new AppResponse(res);
  try {
    // create client model
    let newClient = new ClientModel({
      email: req.body.email,
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname
    });

    // store hashed password in user object.
    newClient.password = await AuthenticationControllerHelpers.hashPassword(
      req.body.password
    );

    // Save client to database
    const savedClient = await newClient.save();
    savedClient.password = undefined;

    // Return newly created client
    return response.success("Client added.", {
      user: savedClient,
      // Sign user with new token
      token: await AuthenticationControllerHelpers.jwtSignUser(
        savedClient.toJSON()
      )
    });
  } catch (err) {
    let errorMessage = "Error registering client.";
    let errorStatusCode = 500;
    if (err.code == 11000) {
      errorMessage =
        Utils.getDuplicateMongoEntryKey(err.message) + " already exists.";
      errorStatusCode = 409;
    }
    return response.failure(errorMessage, errorStatusCode);
  }
}

async function registerGuest(req, res) {
  const response = new AppResponse(res);

  let { firstname, lastname, email } = req.body;

  // generate random password - this is only to prevent people logging into a guest account
  let password = await AuthenticationControllerHelpers.generateRandomPassword();

  try {
    let newGuest = new GuestModel({
      // default username is the user's email
      username: email,
      firstname: firstname,
      lastname: lastname,
      email: email
    });

    // hash password
    newGuest.password = await AuthenticationControllerHelpers.hashPassword(
      password
    );

    // save guest in database
    let createdGuest = await newGuest.save();

    // create a password reset for the guest for when they want to activate their account.
    let { token } = await AuthenticationControllerHelpers.createPasswordReset(
      createdGuest
    );

    // send guest an email containing a link to activate their account.
    let mailer = new Mailer();
    mailer.confirmNewUser(createdGuest, token).send();

    // send back newly created guest
    createdGuest.password = undefined;

    return response.success("Guest created successfully", {
      user: createdGuest,
      token: await AuthenticationControllerHelpers.jwtSignUser(createdGuest)
    });
  } catch (error) {
    let errorMessage = "Error creating guest.";
    let errorCode = 500;

    if (error.code == 11000) {
      errorMessage =
        Utils.getDuplicateMongoEntryKey(error.message) + " already exists";
    }
    return response.failure(errorMessage, errorCode);
  }
}

// Login the client and provide them with an access token
async function login(req, res) {
  const response = new AppResponse(res);
  try {
    if (!req.body.password)
      throw {
        message: "Invalid password.",
        code: 401
      };

    // Find matching users in database
    const userMatches = await UserModel.find({
      username: req.body.username
    }).select("+password");

    // Only 1 user should be found - use 0th term just in case
    const matchingUser = userMatches[0];
    // Check user exists
    if (!matchingUser) {
      // user doesn't exist - send error
      throw {
        message: "Incorrect login information.",
        code: 401
      };
      return;
    }

    // Hash password and check against hash in database
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      matchingUser.password
    );

    if (!isPasswordValid) {
      // Invalid password - send error.
      throw {
        message: "Incorrect password.",
        code: 401
      };
    }

    matchingUser.password = undefined;

    // return user with new access token.
    const token = await AuthenticationControllerHelpers.jwtSignUser(
      matchingUser
    );

    return response.success("User logged in", {
      user: matchingUser,
      token: token
    });

    return;
  } catch (err) {
    let errorMessage = err.message || "An error has occured";
    let errorCode = err.code || 500;

    // Generic error message so as to not reveal too much about the login process.
    return response.failure(errorMessage, errorCode);
  }
}

async function refreshToken(req, res) {
  const response = new AppResponse(res);
  try {
    // create new token
    const newToken = AuthenticationControllerHelpers.jwtSignUser(req.user);

    // return new token and original user
    return response.success("Token refreshed successfully.", {
      token: newToken,
      user: req.user
    });
  } catch (err) {
    return response.failure("An error occured refreshing the token", 500);
  }
}

async function forgotPassword(req, res) {
  const response = new AppResponse(res);
  // get the email from the request body and search for the user associated with it.
  let email = req.body.email;
  try {
    let foundUser = await UserModel.findOne({
      email: email
    });

    if (!foundUser)
      throw {
        message: "There is no user with that email",
        code: 200
      };

    // get ip address of request.
    let requestIp =
      req.header("x-forwarded-for") || req.connection.remoteAddress;

    let {
      token,
      passwordReset
    } = await AuthenticationControllerHelpers.createPasswordReset(foundUser);

    // send email
    let mailer = new Mailer();
    mailer.forgotPassword(foundUser, token, requestIp).send();

    // let the user know the email was sent.
    return response.success(
      "Email sent sucessfully. If you can't find it, check your spam folder!"
    );
  } catch (error) {
    return response.failure(
      error.message || "Error finding user associated with that email",
      error.code || 400
    );
  }
}

async function resetPassword(req, res) {
  let token = req.body.token;
  let password = req.body.password;

  const response = new AppResponse(res);
  // create token hash
  let tokenHash = AuthenticationControllerHelpers.generateTokenHash(token);
  try {
    // use hash as id to find relevant password reset in db.
    let foundPasswordReset = await PasswordResetModel.findOne({
      hash: tokenHash
    });
    if (!foundPasswordReset)
      throw {
        message: "Invalid token",
        code: 400
      };
    // users only have 30 mins to reset password.
    let tokenExpiryTime = 30;
    let tokenExpires = moment(foundPasswordReset.timestamp).add(
      tokenExpiryTime,
      "minutes"
    );

    // check if the token has expired.
    if (moment().isAfter(tokenExpires)) {
      // remove the password reset from the db - we don't need to await this.
      await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);
      throw {
        message: "Token has expired.",
        code: 410
      };
    }

    // Token is valid!! reset the users password.
    let newPassword = await AuthenticationControllerHelpers.hashPassword(
      password
    );
    let updatedUser = await UserModel.findByIdAndUpdate(
      foundPasswordReset.userId,
      {
        password: newPassword
      }
    );

    // if the user was previously a guest turn them into a client.
    if (updatedUser.role == Role.Guest) {
      // create new client model
      let newClient = new ClientModel({
        _id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        password: newPassword
      });

      // delete guest account
      await GuestModel.findByIdAndDelete(updatedUser._id);

      // save new client
      updatedUser = await newClient.save();
    }
    updatedUser.password = undefined;

    // remove the password reset from the db so that it can't be reused.
    await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);

    // send back the updated user.
    return response.success("Password updated successfully", {
      updatedUser: updatedUser
    });
  } catch (error) {
    return response.failure(
      error.message || "Error resetting password",
      error.code || 500
    );
  }
}

module.exports = {
  registerClient,
  login,
  refreshToken,
  registerCounsellor,
  forgotPassword,
  resetPassword,
  registerGuest
};
