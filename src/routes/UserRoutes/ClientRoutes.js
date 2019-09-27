const express = require("express");
const router = express.Router();

const ClientController = require("../../controllers/UserControllers/ClientController");
const AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
const Role = require("../../models/Role");

// get list of all clients.
router.get("/", ClientController.getAllClients);

// get info about client
router.get("/full/:clientId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), ClientController.getClient);

//  update client details
// router.post("/update/:clientId", ClientControllerPolicy.updateClient);

module.exports = router;