const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const Config = require("../../struct/Config");
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const Role = require("../../models/Role");
const axios = require("axios");

// #############################
//      HELPER FUNCTIONS
// #############################

// Give client a token for validation in other parts of the API
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
    const accessToken = jwt.sign(user, Config.accessTokenSecret, {
        expiresIn: "30m"
    });

    return accessToken;
}


// Create a refresh token for the user. This has a TTL of 1 week, and can be used to generate new access tokens if the user's current one has expired.
// It is important to note that these can ONLY be used for creating new access tokens - they can't be used to access resources.
function createRefreshToken(user, req, salt) {

    // create a HMAC hash containing the user's user agent, their user Id and their password.
    const userAgent = req.headers['user-agent'];

    const refreshToken = crypto.createHmac("sha256", Config.refreshTokenSecret);
    const payload = userAgent + user._id + user.password;
    refreshToken.update(payload);
    // salt payload to prevent attacker being able to compare two tokens to see if they are the same.
    refreshToken.update(salt);
    return refreshToken.digest("hex");
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
function generateRandomToken() {
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
    let token = await generateRandomToken();

    // create a hash of the token to store in a database.
    let tokenHash = generateTokenHash(token);

    // store hash and timestamp in the database.
    const passwordReset = await PasswordResetModel.create({
        hash: tokenHash,
        userId: user._id,
        isGuest: user.role == Role.Guest
    });

    return {
        token,
        passwordReset
    };
}



async function calculateIpDistance(ip1, ip2) {
    console.log(Config.location.ipStackApiKey);
    // get rough location of ips
    const ipStack = axios.create({
        baseURL: "http://api.ipstack.com/",
    });
    ipStack.interceptors.request.use((config) => {
        config.params = {
            access_key: Config.location.ipStackApiKey
        }
        return config;
    });

    let loc1 = await ipStack.get(ip1);
    let loc2 = await ipStack.get(ip2);
    console.log(loc1.latitude, loc1.longitude);
    console.log(loc2.latitude, loc2.longitude);

    // calculate distance using Haversine formula
    // const diff


}

module.exports = {
    createRefreshToken,
    generateTokenHash,
    hashPassword,
    createAccessToken,
    createPasswordReset,
    generateRandomPassword,
    generateRandomToken,
    calculateIpDistance

}