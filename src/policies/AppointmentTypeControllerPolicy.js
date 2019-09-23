const Utils = require("../utils/Utils");
const ErrorController = require("../controllers/ErrorController");
const Joi = require("joi");

function updateAppointmentType(req, res, next) {

  try {
    const newAppointmentTypeProperties = req.body.appointmentTypeProperties;
    const appointmentTypeId = req.params.appointmentTypeId;

    // validate id - we don't need to do a presence check, as the endpoint only exists with a appointment type id 
    let validAppointmentType = Utils.validateMongoId(appointmentTypeId);
    if (!validAppointmentType) {
      throw ({
        message: "Invalid appointment type id",
        code: 400
      });
    }

    // check for new properties.
    if (!newAppointmentTypeProperties) {
      throw ({
        message: "No properties specified.",
        code: 400
      });
    }

    // I haven't checked for valid appointment type properties.
    // If there are appointment properties in the request body that don't exist in the model, they will be ignored.

    // input is good
    next();

  } catch (error) {
    console.log(error);
    ErrorController.sendError(res, error.message, error.code);
  }
}


function createAppointmentType(req, res, next) {

  const joiSchema = {
    name: Joi.string().max(20).required(),
    duration: Joi.number().required(),
    description: Joi.string().max(200),
    isRecurring: Joi.boole()
  }

  // validate the request body against the schema
  const {
    error
  } = Joi.validate(req.body, joiSchema);

  // set error message and code. These will be overwritten if there is a more specific error.
  let errorMessage;
  let errorCode;

  // check error
  if (error) {
    switch (error.details[0].context.key) {
      case "name":
        errorCode = 400;
        errorMessage = "Must include valid name.";
        break;
      case "duration":
        errorCode = 400;
        errorMessage = "Must include valid duration."
        break;
      case "description":
        errorCode = 400;
        errorMessage = "Invalid Description.";
        break;
      case "isRecurring":
        errorCode = 400;
        errorMessage = "Value of isRecurring must be boolean."
        break;
      default:
        errorCode = 500;
        errorMessage = "Error creating appointment type.";
        break;
    }
    // send the error
    ErrorController.sendError(res, errorMessage, errorCode);
    return;
  }
  next();

}



module.exports = {
  createAppointmentType,
  updateAppointmentType
}