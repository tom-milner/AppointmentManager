const express = require("express");
const router = express.Router();

// import policies
const ClientControllerPolicy = require("../../policies/UserPolicies/ClientControllerPolicy");

const ClientController = require("../../controllers/UserControllers/ClientController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Role = require("../../models/Role");

// all routes are under "/clients"

// All routes require the user to be logged in.
router.use(AuthenticationMiddleware.isLoggedIn);

// get list of all clients.
router.get("/", ClientController.getClients);

// get info about client
router.get("/full/:clientId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor,
}), ClientController.getClient({
  reduced: false
}));


// update client details
router.post("/:clientId", AuthenticationMiddleware.roleCheck({
  role: Role.Client,
  userSpecific: true,
}), ClientControllerPolicy.updateClient, ClientController.updateClient);

module.exports = router;