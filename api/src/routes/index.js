const express = require("express");
const router = express.Router();

const AuthenticationRoutes = require("./AuthenticationRoutes");
const AppointmentRoutes = require("./AppointmentRoutes/AppointmentRoutes");
const UserRoutes = require("./UserRoutes/UserRoutes");
const AdminRoutes = require("./UserRoutes/AdminRoutes");


// setup routes
router.use("/auth", AuthenticationRoutes);
router.use("/appointments", AppointmentRoutes);
router.use("/user", UserRoutes);
router.use("/admin", AdminRoutes);


module.exports = router;