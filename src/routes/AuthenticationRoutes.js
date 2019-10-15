const express = require("express");
const router = express.Router();

const AuthenticationController = require("../controllers/AuthenticationController/AuthenticationController");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const Role = require("../models/Role");


const AuthenticationControllerPolicy = require("../policies/AuthenticationControllerPolicy");

// these routes are all under "/auth"

// Creating new Clients
router.post("/register/client", AuthenticationControllerPolicy.updateUser({
  isGuest: false,
  isNew: true
}), AuthenticationController.registerClient)

// Creating new Counsellors 
router.post("/register/counsellor",
  AuthenticationMiddleware.isLoggedIn,
  AuthenticationMiddleware.roleCheck(Role.Counsellor), AuthenticationControllerPolicy.updateUser({
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

// refresh the current token
router.get("/token", AuthenticationMiddleware.isLoggedIn, AuthenticationController.refreshToken);


// forgot password
router.post("/forgot-password", AuthenticationControllerPolicy.forgotPassword, AuthenticationController.forgotPassword)

// reset password
router.post("/reset-password", AuthenticationControllerPolicy.resetPassword, AuthenticationController.resetPassword)

module.exports = router;