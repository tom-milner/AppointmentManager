// This file contains policies for the appointment type controller.

const Utils = require("../utils/Utils");
const AppResponse = require("../struct/AppResponse");
const Joi = require("joi");

/**
 * Validate the appointment information.
 * The function will perform checks depending on whether the appointment is new or not.
 * @param {boolean} isNew - Whether the appointment is new or not.
 */
function updateAppointmentType({ isNew }) {
  // Return a function to use a route handler.
  return function(req, res, next) {
    const response = new AppResponse(res);
    const joiSchema = {
      name: Joi.string().max(20),
      duration: Joi.number()
        .min(50)
        .max(110),
      description: Joi.string()
        .max(500)
        .allow(""),
      isRecurring: Joi.bool()
    };

    // These fields are only required if a new appointment type is being created.
    if (isNew) {
      joiSchema.name.required();
      joiSchema.duration.required();
    }

    let data;
    if (!isNew) data = req.body.appointmentTypeProperties;
    else data = req.body;

    // Only check the reccurring duration if the appointment type is a recurring one.
    if (data.isRecurring)
      joiSchema.recurringDuration = Joi.number()
        .max(10)
        .min(2);

    // validate the request body against the schema
    const { error } = Joi.validate(data, joiSchema, {
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
          let errorDetails = error.details[0];
          errorMessage = "Duration must be ";
          if (errorDetails.type == "number.min") errorMessage += `above ${errorDetails.context.limit}`;
          else if (errorDetails.type == "number.max") errorMessage += `below ${errorDetails.context.limit}`;
          errorMessage += " minutes.";
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
          // Build the error message depending on whether 'recurringDuration' is too little or too many.
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

    // If the user is updating an existing appointment, perform some extra checks.
    if (!isNew) {
      const appointmentTypeId = req.params.appointmentTypeId;

      // validate id - we don't need to do a presence check, as the endpoint only exists with a appointment type id
      let validAppointmentType = Utils.validateMongoId(appointmentTypeId);
      if (!validAppointmentType) return response.failure("Invalid appointment type id", 400);
    }

    next();
  };
}

/**
 * Vaidate the supplied Id of an appointment to delete.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
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
