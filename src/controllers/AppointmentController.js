// Import required models
const AppointmentModel = require("../models/AppointmentModel");
const UserModel = require("../models/UserModel");


// Fetch all appointments regardless 
function getAllAppointments(req, res) {
    AppointmentModel.find({}, function (err, allAppointments) {
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

// Return appointments of user
async function getAppointmentsOfUser(req, res) {
    try {
        const userId = req.params.userId;
        // Find user with given Id
        const user = await UserModel.findOne({
            _id: userId
        });
        if (!user) {
            throw ("User not found");
        }

        const userAppointments = await AppointmentModel.find({
            client: userId
        });

        res.status(200).send({
            success: true,
            appointments: userAppointments
        });

    } catch (errorMessage) {
        res.status(400).send({
            success: false,
            message: errorMessage || "Error getting user appointments."
        });
    }
}

// Insert new appointment into db
async function insertAppointment(req, res) {
    try {
        if (!req.body.date) {
            throw ("Date is required");
        }
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
                console.log(err);
                throw ("Database error.");
            } else {
                // Send back new appointment
                res.send({
                    success: true,
                    newAppointment
                });
            }
        });

        // Catch any errors and respond appropriately
    } catch (errorMessage) {
        defaultMessage = "Error creating appointment";
        res.status(500).send({
            error: errorMessage || defaultMessage
        });
    }
}


module.exports = {
    insertAppointment,
    getAllAppointments,
    getAppointmentsOfUser
};