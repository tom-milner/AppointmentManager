const Joi = require("joi");
const Role = require("../models/Role");
const AppointmentModel = require("../models/MongooseModels/AppointmentModel");
const Utils = require("../utils/Utils");
const moment = require("moment");
const AppResponse = require("../struct/AppResponse")

function createAppointment(req, res, next) {
    const response = new AppResponse(res);
    // first check presence
    const joiSchema = {
        startTime: Joi.date().required(),
        title: Joi.string().required().max(200),
        typeId: Joi.string().required(),
        counsellorId: Joi.string().required(),
        clientNotes: Joi.string().allow(""),
        clientId: Joi.string().allow(""),
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
            case "title":
                errorMessage = "Invalid title.";
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
            case "clientId":
                errorMessage = "Invalid client Id";
                break;
            default:
                errorMessage = "Error creating appointment";
                break;
        }

        return response.failure(
            errorMessage,
            errorCode
        )
    }

    // check typeId
    let typeIdIsValid = Utils.validateMongoId(validatedBody.typeId);
    if (!typeIdIsValid) {
        return response.failure(
            "Invalid appointment type id",
            400
        );
    }

    // check counsellor Id
    let counsellorIdIsValid = Utils.validateMongoId(
        validatedBody.counsellorId
    );
    if (!counsellorIdIsValid) {
        return response.failure(
            "Invalid counsellor id",
            400
        );
    }

    // check client Id
    if (validatedBody.clientId) {
        let clientIsValid = Utils.validateMongoId(validatedBody.clientId);
        if (!clientIsValid) {
            return response.failure(
                "Invalid client id",
                400
            );
        }
    }

    // clients can't make appointments in past
    let now = moment();
    if (moment(validatedBody.startTime).isBefore(now)) {
        return response.failure(
            "Appointment start time must be in the future",
            400
        );
    }

    // let the request through - all data is valid.
    next();

}


// checks if user has required access level to change property
function updateAppointment(req, res, next) {
    const response = new AppResponse(res);


    //  validate appointment Id
    let validAppointmentId = Utils.validateMongoId(req.params.appointmentId);
    if (!validAppointmentId) {
        return response.failure(
            "Invalid appointment Id",
            400
        );
    }

    // validate body (Joi isn't needed as there's only one variable to validate)
    if (!req.body.appointmentProperties) {
        return response.failure(
            "No properties found",
            400
        )
    }

    let requestedAppointmentProperties = Object.keys(
        req.body.appointmentProperties
    );

    // get list of all the properties of the model.
    // AppointmentModel.schema is the original schema of the model. .paths is an object containing all tyhe properties of the schema.
    let allAppointmentProperties = Object.keys(AppointmentModel.schema.paths);

    // allowedProperties is a whitelist of properties that can be edited
    let allowedProperties = [];
    switch (req.user.role) {
        // no case for guests - they can't edit anything
        case Role.Client:
            // client can only access clientCanAttend (for now)
            // TODO: Move this into file of constants
            allowedProperties.push("clientCanAttend", "clientNotes");
            break;
        case Role
        .Counsellor: // THIS IS INTENTIONAL!! If the users role if Counsellor the switch will cascade to admin, as they (currently) have the same update rights.
        case Role.Admin:
            // counsellors and admins can access everything
            allowedProperties = allowedProperties.concat(allAppointmentProperties);
            break;
    }

    // check properties user wants to update against properties they're allowed to update
    // if any properties not in the allowed properties list are found, they awill be added to disallowedProperties
    const disallowedProperties = requestedAppointmentProperties.filter(
        property => {
            // return true of property isn't found
            return allowedProperties.indexOf(property) == -1;
        }
    );
    // if user is requesting anything not in allowedProperties, reject the request
    if (disallowedProperties.length > 0) {
        return response.failure(
            "You do not have access to change those properties.",
            400, {
                disallowedProperties: disallowedProperties
            }
        )
    }

    // user can access all properties - allow request to be processed
    next();

}

function deleteAppointment(req, res, next) {
    const response = new AppResponse(res);

    let appointmentId = req.params.appointmentId;
    let deleteRecurring = req.body.deleteRecurring;
    console.log(req.body);
    if (deleteRecurring && typeof deleteRecurring !== "boolean") {
        return response.failure("deleteRecurring must be a boolean", 400);

    }

    let validId = Utils.validateMongoId(appointmentId);
    if (!validId) {
        return response.failure("Invalid Id", 400);
    }
    console.log(validId);
    next();
}

module.exports = {
    createAppointment,
    updateAppointment,
    deleteAppointment
};