const express = require("express");
const router = express.Router();

const AuthenticationController = require("../controllers/AuthenticationController/AuthenticationController");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const AuthenticationControllerPolicy = require("../policies/AuthenticationControllerPolicy");

// Chese routes are all under "/auth", and are for any operations concerning authentication.
// The register routes are in this file insted of the specific guest/client/counsellor files because they are all similar, and require similar middleware.

// Creating new Clients
router.post("/register/client", AuthenticationControllerPolicy.updateUser({
    isGuest: false,
    isNew: true
}), AuthenticationController.registerClient)

// Creating new Counsellors 
router.post("/register/counsellor",
    AuthenticationControllerPolicy.updateUser({
        isGuest: false,
        isNew: true
    }), AuthenticationController.registerCounsellor)

// Create new guest
router.post("/register/guest", AuthenticationControllerPolicy.updateUser({
    isGuest: true,
    isNew: true
}), AuthenticationController.registerGuest);

// universal login
router.post("/login", AuthenticationController.login);

// universal logout
router.post("/logout", AuthenticationMiddleware.isLoggedIn, AuthenticationController.logout)

// refresh the current token
router.get("/token", AuthenticationController.refreshAccessToken);


// forgot password
router.post("/forgot-password", AuthenticationControllerPolicy.forgotPassword, AuthenticationController.forgotPassword)

// reset password
router.post("/reset-password", AuthenticationControllerPolicy.resetPassword, AuthenticationController.resetPassword)

module.exports = router;