var express = require("express");
var router = express.Router();

var AppointmentController = require("../controllers/AppointmentController");

// status check
router.get("/status", function (req, res) {
  res.json({
    status: "OK"
  })
});

// get all appointments
router.get("/", AppointmentController.getAllAppointments);

// insert new appointment
router.post("/", AppointmentController.insertAppointment);


module.exports = router;