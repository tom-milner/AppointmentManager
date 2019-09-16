const express = require("express");
const router = express.Router();

// import controller
const UserController = require("../controllers/UserController");
const UserControllerPolicy = require("../policies/UserControllerPolicy");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
const Role = require("../models/Role");

// these routes are all under "/user"

// All routes require the user to be logged in.
router.use(AuthenticationMiddleware.isLoggedIn);

// get list of usernames from list of user Ids
router.get("/", UserControllerPolicy.getReducedUsers, UserController.getReducedUsers);

// get list of counsellors
router.get("/counsellors", UserController.getAllCounsellorsReduced);

// update counsellor
router.post("/counsellors/:counsellorId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor,
  useSpecific: true
}), UserControllerPolicy.updateCounsellor, UserController.updateCounsellor)

// get all info about a counsellor
router.get("/counsellors/full/:counsellorId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), UserController.getCounsellor({
  reduced: false
}));

// get reduced info about a counsellor (wokring hours, name etc)
router.get("/counsellors/:counsellorId", UserController.getCounsellor({
  reduced: true
}));

module.exports = router;