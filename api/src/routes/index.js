const express = require("express");
const router = express.Router();

// This file is the root router file. It imports all the other routers and exposes them under "/"

// Import the routers for the different sections of the API.
const AuthenticationRoutes = require("./AuthenticationRoutes");
const AppointmentRoutes = require("./AppointmentRoutes/AppointmentRoutes");
const UserRoutes = require("./UserRoutes/UserRoutes");
const AdminRoutes = require("./UserRoutes/AdminRoutes");

// setup routes
router.use("/auth", AuthenticationRoutes); // The authentication routes
router.use("/appointments", AppointmentRoutes); // The appointment routes.
router.use("/user", UserRoutes); // The user routes.
router.use("/admin", AdminRoutes); // The admin routes.


module.exports = router;