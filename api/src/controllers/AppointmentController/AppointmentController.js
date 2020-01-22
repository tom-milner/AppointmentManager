// Import required models
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const AppointmentTypeModel = require("../../models/MongooseModels/AppointmentTypeModel");
const AppointmentControllerHelpers = require("./AppointmentControllerHelpers");
const AppResponse = require("../../struct/AppResponse");
const Roles = require("../../models/Roles");
const moment = require("moment");
const Mailer = require("../../struct/mailer/Mailer");
const Logger = require("../../struct/Logger");

/**
 * Fetch all appointments.This is never used in the app, it is only here for testing + maintenance purposes.
 * @param {Object} req 
 * @param {Object} res
 * @returns {AppResponse} AppResponse object.
 */
async function getAllAppointments(req, res) {
    const response = new AppResponse(res);
    try {
        // get appointments and sort them by start time in ascending order.
        let allAppointments = await AppointmentModel.find({}).sort({
            startTime: "asc"
        });

        // return the appointments
        return response.success("Successfully returned appointments", allAppointments);
    } catch (error) {
        Logger.error("Error fetching all appointments.", err);
        return response.failure("An error has occured sending appointments");
    }
}

/**
 * Get all the appointments of a specific user.
 * @param {boolean} reduced Whether or not to return appointments with reduced details.
 * @param {boolean} isCounsellor Whether or not the user we're looking for is a counsellor.
 * @returns {Function} Request handler.
 */
function getAppointmentsOfUser({
    reduced,
    isCounsellor
}) {

    // Return the function to be used by the request handler.
    return async function (req, res) {
        const response = new AppResponse(res);
        // dynamically construct mongoose query
        const appointmentQuery = AppointmentModel.find();

        // get info from params + query
        const userId = req.params.userId;
        let fromTime = req.query.fromTime;
        let limitTime = req.query.limitTime;

        // adjust query so that only appointments after fromTime will be selected.
        if (fromTime) appointmentQuery.where("startTime").gte(fromTime);

        if (limitTime) appointmentQuery.where("startTime").lte(limitTime);

        // check whether we should seach for counsellor or client
        if (isCounsellor) {
            appointmentQuery.where("counsellorId", userId);
            // include counsellor notes
            appointmentQuery.select("+counsellorNotes");
        } else {
            appointmentQuery.where("clients", userId);
        }

        // sort appointments in ascending order
        appointmentQuery.sort({
            startTime: "asc"
        });

        // check limits
        let limit = parseInt(req.query.limit);
        if (limit) appointmentQuery.limit(limit);

        try {
            // execute the query
            let appointments = await appointmentQuery.exec();
            // check whether user wants reduced appointments or not.
            if (reduced) {
                // remove everything but startTime, endTime and title
                // this was originally implemented as a projection, however mongo doesn't support both inclusion and exclusion on a single projection.
                appointments = appointments.map(appointment => ({
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    // Set title to "Counsellor Appointment" so as not to expose any clients.
                    title: isCounsellor ? "Counsellor Appointment" : appointment.title,
                    appointmentType: {
                        // Overwrite the appointment type color if it's a counsellor's appointment so as not to expose any other client's info / appointment types.
                        color: isCounsellor ? "#888" : appointment.appointmentType.color
                    }
                }));
            }

            return response.success("Appointments returned successfully", {
                appointments: appointments
            });
        } catch (error) {
            // return an error message
            return response.failure("Error returning appointments.", 400);
        }
    };
}

/**
 * Insert new appointment into db.
 * @param {{}} req The request data
 * @param {{}} res The response data
 * @returns {AppResponse} App Response Object.
 */
async function createAppointment(req, res) {
    const response = new AppResponse(res);

    // load  info from body
    const appointmentTypeId = req.body.typeId;
    const counsellorId = req.body.counsellorId;
    let counsellorNotes, clientNotes;
    let clients = [];

    // only counsellors can make appointments for other people and set counsellor notes
    if (req.user.role >= Roles.COUNSELLOR) {
        clients = req.body.clients;
        counsellorNotes = req.body.counsellorNotes;
    } else {
        // clients can only make appointments for themselves.
        clients[0] = req.user._id;
        clientNotes = req.body.clientNotes;
    }
    try {
        // make sure the appointment type exists
        let appointmentType = await AppointmentTypeModel.findById(appointmentTypeId);
        if (!appointmentType) return response.failure("Appointment type doesn't exist", 400);

        // Create apppointment start and end times.
        let appointmentStartTime = moment(req.body.startTime);
        // calculate end time
        let appointmentEndTime = moment(appointmentStartTime);
        appointmentEndTime.add(appointmentType.duration, "minutes");

        let appointmentInfo = {
            title: req.body.title ||
                undefined, // If there is no appointment title, remove the property from the object.
            startTime: appointmentStartTime,
            endTime: appointmentEndTime,
            clients: clients,
            counsellorId: counsellorId,
            clientNotes: clientNotes,
            counsellorNotes: counsellorNotes,
            appointmentType: appointmentType
        };

        // make sure all the appointments are available
        let {
            error,
            appointments
        } = await AppointmentControllerHelpers.checkAllAppointments(appointmentInfo);
        if (error) {
            return response.failure(error.message, 400, {
                clashInfo: error.clashInfo ? error.clashInfo[0] : undefined
            });
        }

        // insert ready appointments into database.
        let createdAppointments = [];
        for (let appointment of appointments) {
            let createdAppointment = await AppointmentModel.create(appointment);
            createdAppointments.push(createdAppointment);
        }

        // Add full client and counsellor information to the first appointment of the series to be used in the email.
        // We don't need to populate all the appointments because you can only create multiple appointments at once if they are recurring appointments, which have the same clients and counsellor.
        await createdAppointments[0]
            .populate("clients")
            .populate("counsellorId")
            .execPopulate();

        // send clients email confirming appointment.
        let mailer = new Mailer();
        mailer.confirmAppointment(createdAppointments, createdAppointments[0].clients, createdAppointments[0]
            .counsellorId).send();


        // Send back new appointment
        return response.success("Appointment created successfully", {
            appointments: createdAppointments
        });
        // Catch any errors and respond appropriately
    } catch (error) {
        console.log(error);
        Logger.error("Error creating appointment.", error);
        return response.failure("Error creating appointment.", 500);
    }
}

/**
 * Update an existing appointment.
 * @param {Object} req 
 * @param {Object} res 
 */
async function updateAppointment(req, res) {
    const response = new AppResponse(res);

    let newAppointmentProperties = req.body.appointmentProperties;
    let appointmentId = req.params.appointmentId;

    try {
        let appointment = await AppointmentModel.findById(appointmentId);
        // check appointment exists.
        if (!appointment) return response.failure("Appointment doesn't exist.", 400);

        // make sure clients can't edit other people's appointments.
        if (req.user.role == Roles.CLIENT) {
            // Search for the user in the client field of the appointment.
            let validClient = appointment.clients.find(userId => userId == req.user._id);
            if (!validClient) return response.failure("You do not have permission to edit this appointment.", 403);
        }

        // If the user is changing the start time of an appointment, they shouldn't be able to change the time of the appointment if it was originally going to be in the next 24 hours.
        if (Object.keys(newAppointmentProperties).includes("startTime")) {
            // Make sure the appointment is available

            // create an object containing the appointment with it's updated properties.
            let newAppointment = {
                ...appointment._doc,
                ...newAppointmentProperties
            };

            let {
                error
            } = await AppointmentControllerHelpers.checkAllAppointments(newAppointment);

            if (error)
                return response.failure(error.message, 400, {
                    clashInfo: error.clashInfo
                });

            const now = moment();
            const next24Hours = now.clone().add(1, "day");
            const requestedStartTime = moment(newAppointmentProperties.startTime);
            if (requestedStartTime.isBetween(now, next24Hours))
                return response.failure(
                    "You cannot reschedule an appointment for the next day.",
                    400
                );

            // They also shouldn't be able to reschedule past appointments.
            const oldStartTime = moment(appointment.startTime);
            if (oldStartTime.isBefore(now)) return response.failure("You can't reschedule a past appointment.",
                400);
        }

        // update appointment
        let updatedAppointment = await AppointmentModel.findByIdAndUpdate(appointmentId, newAppointmentProperties, {
            // get the newly created appointment
            new: true,
            runValidators: true
        });

        return response.success("Appointment updated successfully", {
            updatedAppointment: updatedAppointment
        });
    } catch (error) {
        console.log(error);
        Logger.error("Error updating appointment", error);
        let errorMessage = "Error updating appointment.";
        let errorCode = 500;
        return response.failure(errorMessage, errorCode);
    }
}

/**
 * Delete an appointment.
 * @param {{}} req The request data
 * @param {{}} res The response data
 */
async function deleteAppointment(req, res) {
    const response = new AppResponse(res);

    let appointmentId = req.params.appointmentId;
    let deleteRecurring = req.body.deleteRecurring;

    try {
        let deletedAppointment = await AppointmentModel.findByIdAndDelete(appointmentId);
        if (!deletedAppointment) return response.failure("Appointment doesn't exist.");

        if (deleteRecurring) {
            // delete all recurring appointments
            await AppointmentModel.deleteMany({
                recurringSeriesId: deletedAppointment.recurringSeriesId
            });
        }
        return response.success("Appointments deleted successfully.");
    } catch (error) {
        return response.failure(error.message || "Error deleting appointment", 400);
    }
}

// expose functions
module.exports = {
    getAllAppointments,
    getAppointmentsOfUser,
    createAppointment,
    updateAppointment,
    deleteAppointment
}