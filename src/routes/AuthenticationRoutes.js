var express = require("express");
var router = express.Router();

const AuthenticationController = require("../controllers/AuthenticationController");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const Role = require("../models/Role");

const AuthenticationControllerPolicy = require("../policies/AuthenticationControllerPolicy");

// these routes are all under "/auth"

// Creating new Clients
router.post("/register", AuthenticationControllerPolicy.register, AuthenticationController.registerClient)

// Creating new Counsellors 
router.post("/register/counsellor", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck(Role.Counsellor), AuthenticationControllerPolicy.register, AuthenticationController.registerCounsellor)

// universal login
router.post("/login", AuthenticationController.login);

// refresh the current token
router.get("/token", AuthenticationMiddleware.isLoggedIn, AuthenticationController.refreshToken);


// reset password
router.post("/forgot-password", AuthenticationControllerPolicy.forgotPassword, AuthenticationController.forgotPassword)

module.exports = router;