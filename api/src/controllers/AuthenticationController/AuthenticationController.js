const bcrypt = require("bcrypt");
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");
const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const GuestModel = require("../../models/MongooseModels/UserModels/GuestModel");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const PasswordResetModel = require("../../models/MongooseModels/PasswordResetModel");
const AuthenticationControllerHelpers = require("./AuthenticationControllerHelpers");
const CounsellorRegistrationModel = require("../../models/MongooseModels/CounsellorRegistrationModel");
const Role = require("../../models/Role");
const Utils = require("../../utils/Utils");
const AppResponse = require("../../struct/AppResponse");
const SessionModel = require("../../models/MongooseModels/SessionModel");
const Logger = require("../../struct/Logger");
const crypto = require("crypto");

let mailer = new Mailer();

// Register a new counsellor
async function registerCounsellor(req, res) {
    const response = new AppResponse(res);

    let { email, username, firstname, lastname, password, counsellorToken } = req.body;

    // assert there is permission to create token
    let tokenHash = await AuthenticationControllerHelpers.generateTokenHash(counsellorToken);

    try {
        let foundReg = await CounsellorRegistrationModel.findOne({
            hash: tokenHash
        });

        if (!foundReg) return response.failure("Invalid token.", 400);

        // check it's for input email.
        if (!(foundReg.email == email)) return response.failure("Invalid email for provided token.", 400);

        // delete counsellor registration
        await CounsellorRegistrationModel.findByIdAndDelete(foundReg._id);

        // hash password
        let passwordHash = await AuthenticationControllerHelpers.hashPassword(password);

        // save counsellor in database
        const savedCounsellor = await CounsellorModel.create({
            email: email,
            username: username,
            firstname: firstname,
            lastname: lastname,
            password: passwordHash
        });
        savedCounsellor.password = undefined;

        return response.success("Counsellor created successfully.", {
            user: savedCounsellor
        });
    } catch (err) {
        if (err.code == 11000) {
            return response.failure(Utils.getDuplicateMongoEntryKey(err.message) + " already exists.", 409);
        }
        return response.failure("Error registering counsellor.", 500);
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
        newClient.password = await AuthenticationControllerHelpers.hashPassword(req.body.password);

        // Save client to database
        const savedClient = await newClient.save();
        savedClient.password = undefined;

        // Send confirmation email to user.
        mailer.confirmNewUser(savedClient).send();

        // Return newly created client
        return response.success("Client added.", {
            user: savedClient
        });
    } catch (err) {
        if (err.code == 11000) {
            return response.failure(Utils.getDuplicateMongoEntryKey(err.message) + " already exists.", 409);
        }
        Logger.error("Error creating client", err);
        return response.failure("Error registering client.", 500);
    }
}

async function registerGuest(req, res) {
    const response = new AppResponse(res);

    let { firstname, lastname, email } = req.body;

    // generate random password - this is only to prevent people logging into a guest account
    let password = await AuthenticationControllerHelpers.generateRandomPassword();

    try {
        // hash password
        let passwordHash = await AuthenticationControllerHelpers.hashPassword(password);

        // save guest in database
        let createdGuest = await GuestModel.create({
            // default username is the user's email
            username: email,
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: passwordHash
        });

        // create a password reset for the guest for when they want to fully activate their account.
        let { resetToken } = await AuthenticationControllerHelpers.createPasswordReset(createdGuest);

        // send guest an email containing a link to activate their account.

        mailer.confirmNewUser(createdGuest, resetToken).send();

        // create access token for guest
        const accessToken = AuthenticationControllerHelpers.createAccessToken(createdGuest);
        // send back newly created guest
        createdGuest.password = undefined;

        return response.success("Guest created successfully", {
            user: createdGuest,
            accessToken: accessToken
        });
    } catch (error) {
        if (error.code == 11000) {
            let fieldKey = Utils.getDuplicateMongoEntryKey(error.message);
            if (fieldKey == "userId")
                return response.failure("This user has already been sent a registration email.", 400);

            return response.failure(`${fieldKey} is already registered.`, 409);
        }
        Logger.error("error creating guest", error);
        return response.failure("Error creating guest.", 500);
    }
}

// Login the client and provide them with an access token
async function login(req, res) {
    const response = new AppResponse(res);

    if (!req.body.password) return response.failure("Please provide a password.", 401);

    try {
        // Find matching users in database
        const matchingUser = await UserModel.findOne({
            username: req.body.username
        }).select("+password");

        if (!matchingUser) {
            // user doesn't exist - send error
            return response.failure("Incorrect login information.", 401);
        }

        // Hash password and check against hash in database
        const isPasswordValid = await bcrypt.compare(req.body.password, matchingUser.password);
        // Invalid password - send error.
        if (!isPasswordValid) return response.failure("Incorrect password.", 401);

        // create a refresh token.
        const salt = crypto.randomBytes(128);
        let refreshToken = AuthenticationControllerHelpers.createRefreshToken(matchingUser, req, salt);

        // Create a session for the user
        await SessionModel.create({
            refreshToken: refreshToken,
            user: matchingUser,
            salt: salt,
            clientIp: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
            userAgent: req.headers["user-agent"]
        });

        // create new access token.
        const accessToken = AuthenticationControllerHelpers.createAccessToken(matchingUser);

        matchingUser.password = undefined;
        return response.success("User logged in", {
            user: matchingUser,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (err) {
        Logger.error("Error logging user in.", err);
        // Generic error message so as to not reveal too much about the login process.
        return response.failure("An error has occured logging you in.", 500);
    }
}

async function refreshToken(req, res) {
    const response = new AppResponse(res);
    try {
        const refreshToken = req.query.refreshToken;

        // check for refresh token in database.
        const foundSession = await SessionModel.findOne({
            refreshToken: refreshToken
        }).populate({
            path: "user",
            select: "+password"
        });
        if (!foundSession) return response.failure("Invalid refresh token", 401);

        // assert that the refresh token was issued to the same device that is using it.
        // create hash using info of device that made the request.
        let computedRefreshToken = AuthenticationControllerHelpers.createRefreshToken(
            foundSession.user,
            req,
            foundSession.salt
        );

        // compare hashes. This will equate to false if the device has a different user-agent, or if the user has recently changed their password.
        const isValid = computedRefreshToken == foundSession.refreshToken;

        // invalidate request and refresh token if above credentials don't match - the token may have been stolen.
        if (!isValid) {
            Logger.warn("Possible token fraud", {
                req,
                foundSession
            });
            await SessionModel.findByIdAndDelete(foundSession._id);
            return response.failure("Invalid session.", 403);
        }

        // Location check:
        // Make sure user is no more than 100km from where they originally acquired the refresh token.#

        // DISABLE THIS IN TESTING (NO IP ADDRESS!!)
        if (process.env.NODE_ENV == "production") {
            const requestIp = req.headers["x-forwarded-for"].split(",")[0] || req.connection.remoteAddress;
            const sessionIp = foundSession.clientIp;
            const { error, distance } = await AuthenticationControllerHelpers.calculateGeoIpDistance(
                requestIp,
                sessionIp
            );
            if (error) {
                Logger.error("Error calculating distance", error);
                return response.failure("Error refreshing token", 500);
            }

            if (distance > 100000) {
                // 100km
                Logger.warn("Possible token fraud", {
                    requestIp,
                    foundSession,
                    distance
                });
                return response.failure("Invalid session.", 403);
            }
        }

        // create new token
        const accessToken = AuthenticationControllerHelpers.createAccessToken(foundSession.user);

        // return new token and original user
        return response.success("Token refreshed successfully.", {
            accessToken: accessToken
        });
    } catch (err) {
        Logger.error("Error refreshing token.", err);
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

        if (!foundUser) return response.failure("A user with that email couldn't be found.", 400);

        // get ip address of request.
        let requestIp = req.header("x-forwarded-for") || req.connection.remoteAddress;

        let { resetToken } = await AuthenticationControllerHelpers.createPasswordReset(foundUser);

        // send email
        mailer.forgotPassword(foundUser, resetToken, requestIp).send();

        // let the user know the email was sent.
        return response.success("Email sent sucessfully. If you can't find it, check your spam folder!");
    } catch (error) {
        if (error.code == 11000) {
            return response.failure("This user has already been sent a password reset email.", 400);
        }
        Logger.error("Error sending forgot password email", error);
        return response.failure("Error sending forgot password email", 500);
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
        if (!foundPasswordReset) return response.failure("Invalid token.", 400);

        // users only have 30 mins to reset password.
        let tokenExpiryTime = 30;
        let tokenExpires = moment(foundPasswordReset.timestamp).add(tokenExpiryTime, "minutes");

        // check if the token has expired.
        if (moment().isAfter(tokenExpires)) {
            // remove the password reset from the db - we don't need to await this.
            await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);
            return response.failure("Token has expired.", 410);
        }

        // Token is valid!! reset the users password.
        let newPassword = await AuthenticationControllerHelpers.hashPassword(password);
        let updatedUser = await UserModel.findByIdAndUpdate(foundPasswordReset.userId, {
            password: newPassword
        });

        // if the user was previously a guest turn them into a client.
        if (updatedUser.role == Role.Guest) {
            // delete guest account
            await GuestModel.findByIdAndDelete(updatedUser._id);

            // create new client model
            updatedUser = await ClientModel.create({
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                password: newPassword
            });
        }
        updatedUser.password = undefined;

        // Expire any refresh tokens given to this user.
        // NOTE: the sessions created with the old password will now be automatically invalidated, as the refreshToken is created as a product of the users password, which has now changed, causing the computed hash to change.
        // However, I remove the old sessions from the database anyway (just do it doesn't fill up).
        await SessionModel.deleteMany({
            user: updatedUser._id
        });

        // remove the password reset from the db so that it can't be reused.
        await PasswordResetModel.findByIdAndDelete(foundPasswordReset._id);

        // send back the updated user.
        return response.success("Password updated successfully", {
            updatedUser: updatedUser
        });
    } catch (error) {
        Logger.error("Error resetting password", error);
        return response.failure("Error resetting password.", 500);
    }
}

async function logout(req, res) {
    const response = new AppResponse(res);
    // To log a user out, we have to expire their refresh token.
    // This means that when their access token expires, they will have to log in to obtain a new token pair (refresh and access).

    try {
        // If the user find and delete the users refresh token.
        await SessionModel.deleteMany({
            userAgent: req.headers["user-agent"],
            user: req.user._id
        });
        return response.success("User logged out successfully");
    } catch (error) {
        Logger.error("Error logging user out.", error);
        return response.failure("There was an error logging you out.", 500);
    }
}

module.exports = {
    registerClient,
    login,
    refreshToken,
    registerCounsellor,
    forgotPassword,
    resetPassword,
    registerGuest,
    logout
};
