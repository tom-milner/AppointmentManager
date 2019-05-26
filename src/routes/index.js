var express = require("express");
var router = express.Router();

const AuthenticationRoutes = require("./AuthenticationRoutes");
const AppointmentRoutes = require("./AppointmentRoutes");

// setup routes
router.use("/auth", AuthenticationRoutes);
router.use("/appointments", AppointmentRoutes);


module.exports = router;