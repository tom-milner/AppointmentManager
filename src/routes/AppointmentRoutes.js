const express = require("express");
const router = express.Router();

let AppointmentController = require("../controllers/AppointmentController");
let AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../policies/AppointmentControllerPolicy");

let Role = require("../models/Role");

// Always requires users to be logged in for these routes - appointments contain personal information 
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get("/client/:userId", AuthenticationMiddleware.roleCheck({
  role: Role.Client,
  userSpecific: true
}), AppointmentController.getAppointmentsOfClient);

// Get all  reduced appointments of a counsellor.
router.get("/counsellor/:userId", AuthenticationMiddleware.roleCheck({
  role: Role.Client,
}), AppointmentController.getAppointmentsOfCounsellor({
  reduced: true
}));

// get all full appointments of a counsellor
router.get("/admin/counsellor/:userId", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentController.getAppointmentsOfCounsellor({
  reduced: false
}))

// Get all appointments
router.get("/", AuthenticationMiddleware.roleCheck({
  role: Role.Counsellor
}), AppointmentController.getAllAppointments);

// Insert new appointment
router.post("/", AppointmentControllerPolicy.insertAppointment, AppointmentController.insertAppointment);

// update an existing appointment
router.post("/update", AppointmentControllerPolicy.updateAppointment, AppointmentController.updateAppointment);


module.exports = router;