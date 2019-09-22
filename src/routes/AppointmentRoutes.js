const express = require("express");
const router = express.Router();

const AppointmentTypeRoutes = require("./AppointmentTypeRoutes");
let AppointmentController = require("../controllers/AppointmentController/AppointmentController");
let AuthenticationMiddleware = require("../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../policies/AppointmentControllerPolicy");
let Role = require("../models/Role");

// These routes are all under "/appointments"

// Always requires users to be logged in for these routes - appointments contain personal information
router.use(AuthenticationMiddleware.isLoggedIn);

// import Appointment Type Routes
router.use("/type", AppointmentTypeRoutes);

// Get all appointments of a specific user
router.get(
  "/client/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Role.Client,
    userSpecific: true
  }),
  AppointmentController.getAppointmentsOfUser({
    isCounsellor: false,
    reduced: false
  })
);

// Get all  reduced appointments of a counsellor.
router.get(
  "/counsellor/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Role.Client
  }),
  AppointmentController.getAppointmentsOfUser({
    reduced: true,
    isCounsellor: true
  })
);

// get all full appointments of a counsellor
router.get(
  "/counsellor/full/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Role.Counsellor
  }),
  AppointmentController.getAppointmentsOfUser({
    reduced: false,
    isCounsellor: true
  })
);

// Get all appointments
router.get(
  "/",
  AuthenticationMiddleware.roleCheck({
    role: Role.Admin
  }),
  AppointmentController.getAllAppointments
);

// Insert new appointment
router.post(
  "/",
  AppointmentControllerPolicy.insertAppointment,
  AppointmentController.insertAppointment
);

// update an existing appointment
router.post(
  "/update/:appointmentId",
  AppointmentControllerPolicy.updateAppointment,
  AppointmentController.updateAppointment
);

module.exports = router;