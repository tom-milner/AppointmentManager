var express = require("express");
var router = express.Router();

const AuthenticationRoutes = require("./AuthenticationRoutes");
const AppointmentRoutes = require("./AppointmentRoutes");
const UserRoutes = require("./UserRoutes");

// setup routes
router.use("/auth", AuthenticationRoutes);
router.use("/appointments", AppointmentRoutes);
router.use("/user", UserRoutes);

module.exports = router;