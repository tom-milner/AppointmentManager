const AppointmentModel = require("../models/AppointmentModel");

// Fetch all appointments regardless 
async function getAllAppointments(req, res) {
    await AppointmentModel.find({}, function (err, allAppointments) {
        if (err) {
            console.log(err);
            res.status(500).send({
                error: "An errror has occured fetching all appointments"
            });
        } else {
            res.send(allAppointments)
        }
    });
}

// Insert new appointment into db
async function insertAppointment(req, res) {
    let appointmentDate = new Date(req.body.date);
    // Create new appointment model
    let appointment = new AppointmentModel({
        title: req.body.title,
        date: appointmentDate,
        client: req.user
    });
    console.log(appointment);
    // Save the model to the database
    await appointment.save(function (err, newAppointment) {
        if (err) {
            res.status(500).send({
                error: "Error creating appointment."
            });
            console.log(err);
        } else {
            // Send back newly created appointment
            res.send({
                success: true,
                newAppointment
            });
        }
    });
}


module.exports = {
    insertAppointment,
    getAllAppointments
};