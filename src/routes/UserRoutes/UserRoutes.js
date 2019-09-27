const express = require("express");
const router = express.Router();

// import controllers
const UserController = require("../../controllers/UserControllers/UserController");
const UserControllerPolicy = require("../../policies/UserControllerPolicy");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const ClientRoutes = require("./ClientRoutes");
const CounsellorRoutes = require("./CounsellorRoutes");

// these routes are all under "/user"

// All routes require the user to be logged in.
router.use(AuthenticationMiddleware.isLoggedIn);

router.use("/clients", ClientRoutes);
router.use("/counsellors", CounsellorRoutes);

// get list of usernames from list of user Ids
router.get("/", UserControllerPolicy.getReducedUsers, UserController.getReducedUsers);

// export the router.
module.exports = router;