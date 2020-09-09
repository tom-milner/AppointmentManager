// This file contains routes for user related operations.

const express = require("express");
const router = express.Router();

// These routes are for any operations that concern users on the system (of any role).

// import controllers
const UserController = require("../../controllers/UserControllers/UserController");
const UserControllerPolicy = require("../../policies/UserPolicies/UserControllerPolicy");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const ClientRoutes = require("./ClientRoutes");
const CounsellorRoutes = require("./CounsellorRoutes");
const Roles = require("../../models/Roles");
// these routes are all under "/user"

// Attach the client and counsellor routes.
router.use("/clients", ClientRoutes);
router.use("/counsellors", CounsellorRoutes);

// Get basic info about users from list of user Ids
router.get("/", UserControllerPolicy.getReducedUsers, UserController.getReducedUsers);

// delete a user
router.post(
  "/delete/:userId",
  AuthenticationMiddleware.isLoggedIn,
  AuthenticationMiddleware.roleCheck({
    userSpecific: true,
    role: Roles.CLIENT
  }),
  UserController.deleteUser
);

// export the router.
module.exports = router;
