const express = require("express");
const router = express.Router();

let AppointmentTypeController = require("../controllers/AppointmentTypeController");
let AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
let Role = require("../models/Role");


// Appointment Type Routes
// All these routes are under the endpoint "appointments/type/"
// Therefore they inherit the middleware declared in appointments.
// For example, all these routes will requrie authentication as all the appointments routes do.

// Create a new appointment type
router.post("/", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeController.createAppointmentType);

// Get all appointment types
router.get("/", AppointmentTypeController.getAllAppointmentTypes);

// Update an appointment type
router.post("/update/:appointmentTypeId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentTypeController.updateAppointmentType)

module.exports = router;