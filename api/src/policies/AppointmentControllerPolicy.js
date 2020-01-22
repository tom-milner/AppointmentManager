const Joi = require("joi");
const Roles = require("../models/Roles");
const AppointmentModel = require("../models/MongooseModels/AppointmentModel");
const Utils = require("../utils/Utils");
const moment = require("moment");
const AppResponse = require("../struct/AppResponse");
const Logger = require("../struct/Logger");

/**
 * Verify the request body contents, including making sure the ids are in the valid format.
 * This function also makes sure that a user can't edit an existing appointment.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
function createAppointment(req, res, next) {
    const response = new AppResponse(res);
    // first check presence
    const joiSchema = {
        startTime: Joi.date().required(),
        title: Joi.string()
            .allow("")
            .max(50),
        typeId: Joi.string().required(),
        counsellorId: Joi.string().required(),
        clientNotes: Joi.string().allow(""),
        clients: Joi.array(),
        counsellorNotes: Joi.string().allow("")
    };

    const {
        error,
        value
    } = Joi.validate(req.body, joiSchema);

    let validatedBody = value;
    let errorMessage = "";
    let errorCode = 400;

    if (error) {
        switch (error.details[0].context.key) {
            case "startTime":
                errorMessage = "Invalid start time";
                break;
            case "typeId":
                errorMessage = "Invalid appointment type Id";
                break;
            case "counsellorId":
                errorMessage = "Invalid counsellorId";
                break;
            case "clientNotes":
                errorMessage = "Invalid clientNotes";
                break;
            case "counsellorNotes":
                errorMessage = "Invalid counsellor notes.";
                break;
            case "clients":
                errorMessage = "Invalid clients.";
                break;
            case "title":
                errorMessage = "Title must be less than 50 characters."
                break;
            default:
                errorMessage = "Error creating appointment";
                Logger.error("Error creating appointment", error);
                break;
        }

        return response.failure(errorMessage, errorCode);
    }

    // check typeId
    let typeIdIsValid = Utils.validateMongoId(validatedBody.typeId);
    if (!typeIdIsValid) {
        return response.failure("Invalid appointment type id", 400);
    }

    // check counsellor Id
    let counsellorIdIsValid = Utils.validateMongoId(validatedBody.counsellorId);
    if (!counsellorIdIsValid) {
        return response.failure("Invalid counsellor id", 400);
    }

    // check client Id
    if (validatedBody.clientId) {
        let clientIsValid = Utils.validateMongoId(validatedBody.clientId);
        if (!clientIsValid) {
            return response.failure("Invalid client id", 400);
        }
    }

    // clients can't make appointments in past
    let now = moment();
    if (moment(validatedBody.startTime).isBefore(now)) {
        return response.failure("Appointment start time must be in the future", 400);
    }

    // let the request through - all data is valid.
    next();
}


/**
 * Check if user has required access level to change an appointment's details.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
async function updateAppointment(req, res, next) {
    const response = new AppResponse(res);

    //  validate appointment Id
    let validAppointmentId = Utils.validateMongoId(req.params.appointmentId);
    if (!validAppointmentId) {
        return response.failure("Invalid appointment Id", 400);
    }

    if (!req.body.appointmentProperties) {
        return response.failure("No properties found", 400);
    }

    let requestedAppointmentProperties = Object.keys(req.body.appointmentProperties);

    // allowedProperties is a whitelist of properties that can be edited
    let allowedProperties = [];
    switch (req.user.role) {
        // no case for guests - they can't edit anything
        case Roles.CLIENT:
            // client can only access clientCanAttend (for now)
            // TODO: Move this into file of constants
            allowedProperties.push("clientCanAttend", "clientNotes", "startTime", "endTime");
            break;
        case Roles
        .COUNSELLOR: // If the users role if Counsellor the switch will cascade to admin, as they (currently) have the same update rights.
        case Roles.ADMIN:
            // get list of all the properties of the model.
            // AppointmentModel.schema is the original schema of the model. .paths is an object containing all type properties of the schema.
            let allAppointmentProperties = Object.keys(AppointmentModel.schema.paths);
            // counsellors and admins can access everything
            allowedProperties = allowedProperties.concat(allAppointmentProperties);
            break;
    }

    // check properties user wants to update against properties they're allowed to update
    // if any properties not in the allowed properties list are found, they awill be added to disallowedProperties
    const disallowedProperties = requestedAppointmentProperties.filter(property => {
        // return true of property isn't found
        return allowedProperties.indexOf(property) == -1;
    });
    // if user is requesting anything not in allowed, reject the request
    if (disallowedProperties.length > 0) {
        return response.failure("You are not authorized to change those properties.", 400, {
            disallowedProperties: disallowedProperties
        });
    }

    // Make sure the user isn't rescheduling the appointment to a past time.
    if (requestedAppointmentProperties.includes("startTime")) {
        const now = moment();
        const startTime = moment(req.body.appointmentProperties.startTime);
        if (startTime.isBefore(now))
            return response.failure("You cannot reschedule an appointment to a past date.", 400);
    }

    // user can access all properties - allow request to be processed
    next();
}

/**
 * Validate data being sent to the deleteAppointment controller.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
function deleteAppointment(req, res, next) {
    const response = new AppResponse(res);

    let appointmentId = req.params.appointmentId;
    let deleteRecurring = req.body.deleteRecurring;
    // deleteRecurring must be a boolean.
    if (deleteRecurring && typeof deleteRecurring !== "boolean") {
        return response.failure("deleteRecurring must be a boolean", 400);
    }

    // Validate the Id.
    let validId = Utils.validateMongoId(appointmentId);
    if (!validId) {
        return response.failure("Invalid Id", 400);
    }
    next();
}

module.exports = {
    createAppointment,
    updateAppointment,
    deleteAppointment
};