const express = require("express");
const router = express.Router();

const GuestController = require("../../controllers/UserControllers/GuestController");
// routes for guest users
// these routes are all under "/guests"

router.post("/", GuestController.createGuestUser);


module.exports = router;