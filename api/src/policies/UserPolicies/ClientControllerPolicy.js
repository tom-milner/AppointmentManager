const AppResponse = require("../../struct/AppResponse");
const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const Utils = require("../../utils/Utils");
const Roles = require("../../models/Roles");
const Logger = require("../../struct/Logger");

/**
 * This function verifies that a user trying to update a client is allowed to.
 * Different users can update different details about a client.
 * The higher the role, the more details a user can edit.
 * @param {{}} req - The request details.
 * @param {*} res - The response details.
 * @param {*} next - The next function in the route handling chain.
 */
function updateClient(req, res, next) {
  const response = new AppResponse(res);
  //  validate appointment Id
  let validClientId = Utils.validateMongoId(req.params.clientId);
  if (!validClientId) return response.failure("Invalid client Id", 400);

  if (!req.body.clientInfo) return response.failure("Please specify info to edit.", 400);

  // The request details to change.
  let requestedClientProperties = Object.keys(req.body.clientInfo);

  // The properties the user is allowed to access.
  let allowedProperties = [];

  // This switch case cascades down, so that each role can access all the properties of the role below it (with the exception of the ADMIN role);
  switch (req.user.role) {
    case Roles.ADMIN:
      // All the possible client properties.
      let clientProperties = Object.keys(ClientModel.schema.paths);
      allowedProperties = allowedProperties.concat(clientProperties);
      break;
    case Roles.COUNSELLOR:
      allowedProperties.push("clinicalNotes");
    // Cascade down so that counsellors can edit same properties as clients.
    case Roles.CLIENT:
      allowedProperties.push("firstname", "lastname", "username", "email");
      break;
    default:
      return response.failure("Invalid Role", 400);
  }

  // TODO: turn this into middleware
  const disallowedProperties = requestedClientProperties.filter(property => {
    return !allowedProperties.find(prop => prop == property);
  });

  if (disallowedProperties.length > 0) {
    // Remove the disallowed fields from the request.
    disallowedProperties.forEach(prop => delete req.body.clientInfo[prop]);

    // If there are still valid properties in the request, allow them through.
    if (Object.values(req.body.clientInfo).length > 0) return next();

    return response.failure("You can't change these details", 403);
  }
  next();
}

module.exports = {
  updateClient
};
