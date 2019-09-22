const Utils = require("../utils/Utils");
const ErrorController = require("../controllers/ErrorController");

function updateAppointmentType(req, res, next) {

  // No need to use Joi - only 2 variables.
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
  // No need to use Joi here - only 2 variables.
  try {

    // check duration
    if (!req.body.duration) throw ({
      code: 400,
      message: "Include an appointment type duration."
    });

    // check name
    if (!req.body.name) throw ({
      code: 400,
      message: "Include an appointment type name"
    });


    next();
  } catch (error) {
    ErrorController.sendError(res, error.message, error.code);
  }
}



module.exports = {
  createAppointmentType,
  updateAppointmentType
}