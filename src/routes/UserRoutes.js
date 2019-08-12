const express = require("express");
const router = express.Router();

// import controller
const UserController = require("../controllers/UserController");
const UserControllerPolicy = require("../policies/UserControllerPolicy");
const AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");

// get list of usernames from list of client Ids
router.get("/", AuthenticationMiddleware.isLoggedIn, UserControllerPolicy.getUsersOfIds, UserController.getUsernamesFromUserIds);


module.exports = router;