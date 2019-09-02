const Joi = require("joi");
const Role = require("../models/Role");
const AppointmentModel = require("../models/MongooseModels/AppointmentModel");

function insertAppointment(req, res, next) {

  const joiSchema = {
    startTime: Joi.date().required(),
    title: Joi.string().required(),
    duration: Joi.required(),
    counsellorId: Joi.string().required(),
    clientNotes: Joi.string()
  }

  const {
    error,
    value
  } = Joi.validate(req.body, joiSchema);

  let errorMessage = "";
  let errorCode = 400;


  if (error) {
    switch (error.details[0].context.key) {
      case "startTime":
        errorMessage = "Invalid start time"
        errorCode = 400;
        break;
      case "title":
        errorMessage = "Invalid title."
        break;
      case "duration":
        errorMessage = "Invalid duration";
        break;
      case "counsellorId":
        errorMessage = "Invalid counsellorId";
        break;
      case "clientNotes":
        errorMessage = "Invalid clientNotes";
        break;
      default:
        errorMessage = "Error creating appointment";
        break;
    }
    console.log(error);

    res.status(errorCode).send({
      message: errorMessage,
      success: false,
    })
  } else {
    // let the request through - all data is valid.
    next();
  }

}

// checks if user has required access level to change property
function updateAppointment(req, res, next) {
  try {
    // first validate body (Joi isn't needed as there's only one variable to validate)
    if (!req.body.appointmentProperties) {
      throw ({
        message: "No properties found",
        code: 400
      });
    }
    let requestedAppointmentProperties = Object.keys(req.body.appointmentProperties);

    // get list of all the properties of the model.
    // AppointmentModel.schema is the original schema of the model. .paths is an object containing all tyhe properties of the schema.
    let allAppointmentProperties = Object.keys(AppointmentModel.schema.paths);

    // get current user 
    let user = req.user;

    // allowedProperties is a whitelist of properties that can be edited
    let allowedProperties = [];
    switch (user.role) {
      // no case for guests - they can't edit anything
      case Role.Client:
        // client can only access clientCanAttend (for now)
        allowedProperties.push("clientCanAttend");
        break;
      case Role.Counsellor:
      case Role.Admin:
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
    // if user is requesting anything not in allowedProperties, reject the request
    if (disallowedProperties.length > 0) {
      throw ({
        message: "You do not have access to change those properties.",
        code: 400,
        disallowedProperties: disallowedProperties
      });
    }
    // user can access all properties - allow request to be processed
    next();
  } catch (error) {
    console.log(error);
    res.status(error.code || 400).send({
      success: false,
      message: error.message || "Error updating appointment",
      disallowedProperties: error.disallowedProperties || undefined
    });
  }
}


module.exports = {
  insertAppointment,
  updateAppointment
}