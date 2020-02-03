const express = require("express");
const router = express.Router();

// These are the routes for operations to do with appointments.

const AppointmentTypeRoutes = require("./AppointmentTypeRoutes");
let AppointmentController = require("../../controllers/AppointmentController/AppointmentController");
let AuthenticationMiddleware = require("../../middleware/AuthenticationMiddleware");
let AppointmentControllerPolicy = require("../../policies/AppointmentControllerPolicy");
let Roles = require("../../models/Roles");

// These routes are all under "/appointments"

// Import Appointment Type Routes
router.use("/type", AppointmentTypeRoutes);

// Get all  reduced appointments of a counsellor.
router.get(
  "/counsellor/:userId",
  AppointmentController.getAppointmentsOfUser({
    reduced: true,
    isCounsellor: true
  })
);

// Always require users to be logged in for the following routes - appointments contain personal information
router.use(AuthenticationMiddleware.isLoggedIn);

// Get all appointments of a specific user
router.get(
  "/client/full/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.CLIENT,
    userSpecific: true
  }),
  AppointmentController.getAppointmentsOfUser({
    isCounsellor: false,
    reduced: false
  })
);

// get reduced appointments about user
router.get(
  "/client/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.CLIENT,
    userSpecific: true
  }),
  AppointmentController.getAppointmentsOfUser({
    isCounsellor: false,
    reduced: true
  })
);

// get all full appointments of a counsellor
router.get(
  "/counsellor/full/:userId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.COUNSELLOR
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
    role: Roles.ADMIN
  }),
  AppointmentController.getAllAppointments
);

// Insert new appointment
router.post("/", AppointmentControllerPolicy.createAppointment, AppointmentController.createAppointment);

// update an existing appointment
router.post(
  "/:appointmentId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.CLIENT
  }),
  AppointmentControllerPolicy.updateAppointment,
  AppointmentController.updateAppointment
);

// delete an appointment
router.post(
  "/delete/:appointmentId",
  AuthenticationMiddleware.roleCheck({
    role: Roles.COUNSELLOR
  }),
  AppointmentControllerPolicy.deleteAppointment,
  AppointmentController.deleteAppointment
);

module.exports = router;
