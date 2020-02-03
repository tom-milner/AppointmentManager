const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Config = require("../../struct/Config");
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const Roles = require("../../models/Roles");
const axios = require("axios");
const Math = require("mathjs");
const Logger = require("../../struct/Logger");

/*
    This file contains helper function for AuthenticationController.js. 
*/

// Give client a token for validation in other parts of the API

/**
 * This function generates a jwt access token for the user to use for the next 30 mins.
 * @param {{}} user - An object containing the user's details.
 * @returns {String} accessToken - The generated access token.
 */
function createAccessToken(user) {
  // get basic info to save about user
  user = {
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    role: user.role,
    _id: user._id
  };

  // Create JWT token.
  const accessToken = jwt.sign(user, Config.ACCESS_TOKEN_SECRET, {
    expiresIn: "30m"
  });

  return accessToken;
}

/**
 * Create a refresh token for the user.This has a TTL of 1 week, and can be used to generate new access tokens
 if the user 's current one has expired. The refresh token is generated using the user's id, password, and the userAgent of the device the request was made on.
 This is so that if the user changes their password any currently active refresh tokens will be invalidated.
 It is important to note that these can ONLY be used for creating new access tokens - they can 't be used to access resources.
 * @param {{}} user - An object containing the user's information.
 * @param {{}} req - The original request details.
 * @param {String} salt - The salt to use to generate the reresh token.
 * @returns {String} refreshToken - The refresh token in hex format.
 */
function createRefreshToken(user, req, salt) {
  // create a HMAC hash containing the user's user agent, their user Id and their password.
  const userAgent = req.headers["user-agent"];

  // Generate the refresh token - a SHA-256 token consisting of the user's id, password, and the requesting device's userAgent.
  const refreshToken = crypto.createHmac("sha256", Config.REFRESH_TOKEN_SECRET);
  const payload = userAgent + user._id + user.password;
  refreshToken.update(payload);

  // Salting the payload means that an attacker won't be able to tell if the contents of two tokens are the same, as the salt is randomly generated for each token.
  refreshToken.update(salt);
  // Return the access token in hex format.
  return refreshToken.digest("hex");
}

/**
 * Hash a password and return the hash.
 * @param {String} password - The password to hash.
 * @returns {
     String
 }
 hash - The hashed passwordParameters
 password The password to hash
 Returns
 hash The generated hash.

 */
async function hashPassword(password) {
  // First, generate salt. saltRounds is the cost factor of hashing algorithm.
  // For example, a saltRounds of 10 will mean that the bcrypt calculation is performed 2^10 (1024) times.
  // The higher the saltRounds, the longer the salt takes to generate, but the more secure the hash.
  // (I use bcrypt here as it is more secure than crypto (the inbuilt cryptography library).)
  const SALT_ROUNDS = 10;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  // Hash  the password with the salt.
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * This function creates a SHA-256 hash of a token. It is different from the hashing function above because it uses the crypto library, which is faster but less secure.
 * @param {String} token - The token to create the hash of.
 * @returns {String} hash - The generated hash.
 */
function generateTokenHash(token) {
  let tokenHash = crypto.createHash("sha256");
  tokenHash.update(token);
  return (tokenHashDigest = tokenHash.digest("hex"));
}

/**
 * This function generates a random 64 bit string using the crypto library.
 * @returns {Promise} token - a promise that will return the token.
 */
function generateRandomToken() {
  // Return a promise so that the function can be awaited (avoids the use of callbacks).
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, function(error, buffer) {
      if (error) reject(error);
      let token = buffer.toString("hex");
      resolve(token);
    });
  });
}

/**
 * This function creates a random 16-bit password to be used as a temporary password for guest users.
   It differs from the above function by returning a base64 string instead of hex.
 */
function generateRandomPassword() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, function(error, buffer) {
      if (error) reject(error);
      // create random string - this was originaly converted to ascii instead of base64, but there are some ascii characters that aren't supported by the database.
      let password = buffer.toString("base64");
      resolve(password);
    });
  });
}
/**
 * This function creates a password reset in the database for a given user.
 * @param {{}} user - The user's detailsTh
 * @returns {{}} {resetToken, passwordReset} - The reset token to use and the full password reset object.
 */
async function createPasswordReset(user) {
  // create random token
  let resetToken = await generateRandomToken();

  // create a hash of the token to store in a database.
  let tokenHash = generateTokenHash(resetToken);

  // create expiry time.
  let now = new Date();
  // 2.628e+6 seconds: 1 month
  // 1800 seconds: 30 mins
  const expireTime = new Date(now.getTime() + (user.role == Roles.GUEST ? 2.628e6 : 1800) * 1000);

  // store hash and timestamp in the database.
  const passwordReset = await PasswordResetModel.create({
    hash: tokenHash,
    userId: user._id,
    expires: expireTime
  });

  return {
    resetToken,
    passwordReset
  };
}

/**
 * This function takes two ip addresses and calculates the approximate distance between them.
 * It gets the approximate locations of the ip addresses by using an ip lookup service, and then uses the haversine
 * @param {String} ip1 - The first ip address.
 * @param {String} ip2 - The second ip address.
 * @returns {Number} distance - The (approximate) geographical distance between the 2 ip addresses.
 */
async function calculateGeoIpDistance(ip1, ip2) {
  // get rough location of ips
  const ipStack = axios.create({
    baseURL: Config.location.IPSTACK_API
  });
  ipStack.interceptors.request.use(config => {
    config.params = {
      access_key: Config.location.IPSTACK_API_KEY
    };
    return config;
  });

  // These would preferably be a single request, but IpStack don't allow querying multiple Ips at once on their free plan.
  let loc1, loc2;
  try {
    loc1 = (await ipStack.get(ip1)).data;
    loc2 = (await ipStack.get(ip2)).data;
  } catch (error) {
    return {
      loc1,
      loc2,
      error
    };
  }
  Logger.info("Token refresh locations.", {
    loc1,
    loc2
  });

  let lon1 = loc1.longitude;
  let lat1 = loc1.latitude;

  let lon2 = loc2.longitude;
  let lat2 = loc2.latitude;

  // calculate distance using Haversine formula
  // haversine(θ) = sin²(θ / 2)
  // a = sin²(φB - φA / 2) + cos φA * cos φB * sin²(λB - λA / 2)
  // c = 2 * atan2(√a, √(1− a))
  // d = R⋅ c

  // Radius of the Earth (in meters)
  const R = 6371e3;

  // convert degrees into radians.
  const phi1 = degToRadians(lat1);
  const phi2 = degToRadians(lat2);

  // change difference between longitudes and  latitudes (and turn to radians)
  const delta_phi = degToRadians(lat2 - lat1);
  const delta_lambda = degToRadians(lon2 - lon1);

  const a =
    Math.pow(Math.sin(delta_phi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(delta_lambda / 2), 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Resulting distance in meters.

  Logger.info("Ip distance calculated.", {
    distance,
    loc1,
    loc2
  });
  return {
    distance
  };
}

/**
 * Ths function turns a degree measurement into radians.
 * @param {Number} deg - The angle in degrees.
 * @returns {Number} rad - The angle in radians.
 */
function degToRadians(deg) {
  // Formula: radians = (pi*degrees)/180
  return (Math.pi * deg) / 180;
}

module.exports = {
  createRefreshToken,
  generateTokenHash,
  hashPassword,
  createAccessToken,
  createPasswordReset,
  generateRandomPassword,
  generateRandomToken,
  calculateGeoIpDistance
};
