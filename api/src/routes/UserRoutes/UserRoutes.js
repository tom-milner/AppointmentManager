const express = require("express");
const router = express.Router();

// import controllers
const UserController = require("../../controllers/UserControllers/UserController");
const UserControllerPolicy = require("../../policies/UserPolicies/UserControllerPolicy");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const ClientRoutes = require("./ClientRoutes");
const CounsellorRoutes = require("./CounsellorRoutes");
const Roles = require("../../models/Roles");
// these routes are all under "/user"



router.use("/clients", ClientRoutes);
router.use("/counsellors", CounsellorRoutes);

// get list of usernames from list of user Ids
router.get("/", UserControllerPolicy.getReducedUsers, UserController.getReducedUsers);

// delete a user
router.post("/delete/:userId", AuthenticationMiddleware.isLoggedIn, AuthenticationMiddleware.roleCheck({
    userSpecific: true,
    role: Roles.CLIENT
}), UserController.deleteUser)
// export the router.
module.exports = router;