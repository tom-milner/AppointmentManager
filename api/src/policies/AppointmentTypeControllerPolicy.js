const Utils = require("../utils/Utils");
const AppResponse = require("../struct/AppResponse");
const Joi = require("joi");

function updateAppointmentType({
    isNew
}) {
    return function (req, res, next) {
        const response = new AppResponse(res);
        const joiSchema = {
            name: Joi.string().max(20),
            duration: Joi.number(),
            description: Joi.string()
                .max(200)
                .allow(""),
            isRecurring: Joi.bool(),

        };

        // These fields are only required if a new appointment type is being created.
        if (isNew) {
            joiSchema.name.required();
            joiSchema.duration.required();
        }

        let data;
        if (!isNew) data = req.body.appointmentTypeProperties;
        else data = req.body

        // Only check the reccurring duration if the appointment type is a recurring one.
        if (data.isRecurring) joiSchema.recurringDuration = Joi.number().max(10).min(2);

        // validate the request body against the schema
        const {
            error
        } = Joi.validate(data, joiSchema, {
            stripUnknown: true // Remove unknown fields.
        });


        // check errors
        if (error) {
            let errorMessage;
            let errorCode;

            switch (error.details[0].context.key) {
                case "name":
                    errorCode = 400;
                    errorMessage = "Must include valid name.";
                    break;
                case "duration":
                    errorCode = 400;
                    errorMessage = "Must include valid duration.";
                    break;
                case "description":
                    errorCode = 400;
                    errorMessage = "Invalid Description.";
                    break;
                case "isRecurring":
                    errorCode = 400;
                    errorMessage = "Value of isRecurring must be boolean.";
                    break;
                case "recurringDuration":
                    errorCode = 400;
                    errorMessage = `You cannot have ${
                        error.details[0].type == "number.min" ? "less than 2" : "more than 10"
                    } recurring appointments.`;
                    break;
                default:
                    errorCode = 500;
                    errorMessage = "Error creating appointment type.";
                    break;
            }

            return response.failure(errorMessage, errorCode);
        }

        // if the user is updating an existing appointment
        if (!isNew) {
            const newAppointmentTypeProperties = req.body.appointmentTypeProperties;
            const appointmentTypeId = req.params.appointmentTypeId;

            // validate id - we don't need to do a presence check, as the endpoint only exists with a appointment type id
            let validAppointmentType = Utils.validateMongoId(appointmentTypeId);
            if (!validAppointmentType) return response.failure("Invalid appointment type id", 400);

            // check for new properties.
            if (!newAppointmentTypeProperties) return response.failure("No properties specified.", 400);
        }

        next();
    };
}

function deleteAppointmentType(req, res, next) {
    const response = new AppResponse(res);
    // check that the supplied ID is the right format.
    let appointmentTypeId = req.params.appointmentTypeId;
    let idIsValid = Utils.validateMongoId(appointmentTypeId);
    if (!idIsValid) {
        return response.failure("Invalid appointment type.", 400);
    }
    next();
}

module.exports = {
    updateAppointmentType,
    deleteAppointmentType
};