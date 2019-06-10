const AppointmentModel = require("../models/AppointmentModel");

// send all appointments regardless 
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

// insert new appointment into db
async function insertAppointment(req, res) {

    // create date object to store
    let appointmentDate = new Date(req.body.date);

    // create new model
    let appointment = new AppointmentModel({
        title: req.body.title,
        date: appointmentDate
    });

    // save the model to the database
    await appointment.save(function (err, newAppointment) {
        if (err) {
            res.status(500).send({error: "Error creating appointment."});
            console.log(err);
        } else {
            res.send(newAppointment);
        }
    });
}


module.exports = {
    insertAppointment: insertAppointment,
    getAllAppointments: getAllAppointments
};