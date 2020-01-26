const express = require("express");
const router = express.Router();

// These routes are for any operations that concern clients.

const ClientControllerPolicy = require("../../policies/UserPolicies/ClientControllerPolicy");
const ClientController = require("../../controllers/UserControllers/ClientController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const AuthenticationControllerPolicy = require("../../policies/AuthenticationControllerPolicy");
const Roles = require("../../models/Roles");

// all routes are under "/clients"

// All routes require the user to be logged in.
router.use(AuthenticationMiddleware.isLoggedIn);

// get all clients.
router.get("/", ClientController.getClients);


// get info about client
router.get("/full/:clientId", AuthenticationMiddleware.roleCheck({
    role: Roles.CLIENT,
    userSpecific: true
}), ClientController.getClient({
    reduced: false
}));


// update client details
router.post("/:clientId", AuthenticationMiddleware.roleCheck({
        role: Roles.CLIENT,
        userSpecific: true,
    }),
    AuthenticationControllerPolicy.updateUser({
        isGuest: false,
        isNew: false
    }), ClientControllerPolicy.updateClient, ClientController.updateClient);

module.exports = router;