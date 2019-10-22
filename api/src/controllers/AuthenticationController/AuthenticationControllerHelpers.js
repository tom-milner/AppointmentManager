const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const Config = require("../../struct/Config");
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const Role = require("../../models/Role");

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
      resolve(token);
    })
  })
}

// generate random password
function generateRandomPassword() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, function (error, buffer) {
      if (error) reject(error);
      // create random string - this was originaly converted to ascii instead of base64, but there are some ascii characters that aren't supported by the db.
      let password = buffer.toString("base64");
      resolve(password);
    })
  })
}

// create password reset 
async function createPasswordReset(user) {
  // create random token
  let token = await generatePasswordResetToken();

  // create a hash of the token to store in a database.
  let tokenHash = generateTokenHash(token);

  // store hash and timestamp in the database.
  let passwordReset = new PasswordResetModel({
    hash: tokenHash,
    timestamp: Date.now(),
    userId: user._id,
    isGuest: user.role == Role.Guest
  });
  let savedPasswordReset = passwordReset.save();
  return {
    token,
    savedPasswordReset
  };
}

module.exports = {
  generateTokenHash,
  hashPassword,
  jwtSignUser,
  createPasswordReset,
  generateRandomPassword
}