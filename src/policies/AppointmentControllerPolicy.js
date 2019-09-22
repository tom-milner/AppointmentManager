const Joi = require("joi");
const Role = require("../models/Role");
const AppointmentModel = require("../models/MongooseModels/AppointmentModel");
const Utils = require("../utils/Utils");


function insertAppointment(req, res, next) {


  // first check presence
  const joiSchema = {
    startTime: Joi.date().required(),
    title: Joi.string().required(),
    typeId: Joi.string().required(),
    counsellorId: Joi.string().required(),
    clientNotes: Joi
  }
  try {
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
          errorMessage = "Invalid start time"
          break;
        case "title":
          errorMessage = "Invalid title."
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
        default:
          errorMessage = "Error creating appointment";
          break;
      }

      throw ({
        message: errorMessage,
        code: errorCode
      })
    }

    // check typeId 
    let typeIdIsValid = Utils.validateMongoId(validatedBody.typeId);
    if (!typeIdIsValid) {
      throw ({
        message: "Invalid appointment type id",
        code: 400
      });
    }

    // check counsellor Id
    let counsellorIdIsValid = Utils.validateMongoId(validatedBody.counsellorId);
    if (!counsellorIdIsValid) {
      throw ({
        message: "Invalid counsellor id",
        code: 400
      });
    }

    // let the request through - all data is valid.
    next();

  } catch (error) {
    res.status(error.code || 500).send({
      message: error.message || "Error validating request body.",
      success: false
    })
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
        // TODO: Move this into file of constants
        allowedProperties.push("clientCanAttend");
        break;
      case Role.Counsellor: // THIS IS INTENTIONAL!! If the users role if Counsellor the switch will cascade to admin, as they (currently) have the same update rights.
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