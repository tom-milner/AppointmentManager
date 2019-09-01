const express = require("express");
const router = express.Router();

// import controller
const UserController = require("../controllers/UserController");
const UserControllerPolicy = require("../policies/UserControllerPolicy");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const Role = require("../models/Role");

// these toutes are all under "/user"

// get list of usernames from list of user Ids
router.get("/", AuthenticationMiddleware.isLoggedIn, UserControllerPolicy.getReducedUsers, UserController.getReducedUsers);

// get list of counsellors
router.get("/counsellors", AuthenticationMiddleware.isLoggedIn, UserController.getAllCounsellors);

// get info about single user 
// TODO: add route to get info from single user (/user/:userId)
// router.get("/:userId", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck())

// update counsellor
router.post("/counsellors/:counsellorId", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor,
  useSpecific: true
}), UserControllerPolicy.updateCounsellor, UserController.updateCounsellor)

// get counsellor
router.get("/counsellors/:counsellorId", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), UserController.getCounsellor);

module.exports = router;