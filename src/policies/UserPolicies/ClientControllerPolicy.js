const ErrorController = require("../../controllers/ErrorController")
const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
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
    if (!req.body.clientInfo) throw ({
      message: "Please specify info to edit.",
      code: 400
    })
    // validate client properties
    let requestedClientProperties = Object.keys(req.body.clientInfo);

    // all the possible client properties
    let clientProperties = Object.keys(ClientModel.schema.paths);

    let allowedProperties = [];
    switch (req.user.role) {
      case Role.Client:
        allowedProperties.push("firstname", "lastname", "username", "email")
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
    console.log(requestedClientProperties);
    const foundProperties = requestedClientProperties.filter(property => {
      return allowedProperties.indexOf(property) == 1;
    });
    console.log(foundProperties);
    if (foundProperties.length < 1) {
      throw ({
        message: "You can't change these details",
        code: 403,
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