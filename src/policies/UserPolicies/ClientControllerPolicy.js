const ErrorController = require("../../controllers/ErrorController")
const ClientModel = require("../../models/MongooseModels/ClientModel");
const Utils = require("../../utils/Utils");
const Role = require("../../models/Role");


// update an existing client
function updateClient(req, res, next) {

  try {
    console.log(req.params);
    //  validate appointment Id
    let validClientId = Utils.validateMongoId(req.params.clientId);
    if (!validClientId) {
      throw {
        message: "Invalid client Id",
        code: 400
      };
    }

    // validate client properties
    let requestedClientProperties = Object.keys(req.body.clientInfo);

    // all the possible client properties
    let clientProperties = Object.keys(ClientModel.schema.paths);

    let allowedProperties = [];
    switch (req.user.role) {
      case Role.Client:
        //TODO
        break;
      case Role.Counsellor:
      case Role.Admin:
        // can edit everything
        allowedProperties = allowedProperties.concat(clientProperties);
        break;
      default:
        throw ({
          mesage: "Invalid Role",
          code: 400
        });
    }

    // TODO: turn this into middleware
    const disallowedProperties = requestedClientProperties.filter(property => {
      return allowedProperties.indexOf(property) == -1;
    });

    if (disallowedProperties.length > 0) {
      throw ({
        message: "You don't have access to these properties",
        code: 403,
        disallowedProperties: disallowedProperties
      })
    }

    next();

  } catch (error) {
    console.log(error);
    ErrorController.sendError(res, error.message || "Error updating appointment", error.code || 400);
  }
}

module.exports = {
  updateClient
};