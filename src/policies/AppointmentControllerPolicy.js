const Joi = require("joi");
const Role = require("../models/Role");
const AppointmentModel = require("../models/AppointmentModel");

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
  let requestedAppointmentProperties = Object.keys(req.body.appointmentProperties);
  // get list of all the properties of the model.
  // AppointmentModel.schema is the original schema of the model. .paths is an object containing all tyhe properties of the schema.
  let user = req.user;
  let allAppointmentProperties = Object.keys(AppointmentModel.schema.paths);

  // TODO: define appointments properties as constants in seperate file (like Role)
  // this is a whitelist of properties that can be edited
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
      allowedProperties.push(allAppointmentProperties);
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
    res.status(400).send({
      success: false,
      message: "You do not have access to change those properties.",
      disallowedProperties: disallowedProperties
    });
  }

  // user can access all properties - allow request to be processed
  next();
}


module.exports = {
  insertAppointment,
  updateAppointment
}