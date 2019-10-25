const AppResponse = require("../../struct/AppResponse")
const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const Utils = require("../../utils/Utils");
const Role = require("../../models/Role");


// update an existing client
function updateClient(req, res, next) {
    const response = new AppResponse(res);
    //  validate appointment Id
    let validClientId = Utils.validateMongoId(req.params.clientId);
    if (!validClientId) return response.failure(
        "Invalid client Id",
        400
    );

    if (!req.body.clientInfo) return response.failure(
        "Please specify info to edit.",
        400
    );

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
            return response.failure(
                "Invalid Role",
                400
            );
    }

    // TODO: turn this into middleware
    const foundProperties = requestedClientProperties.filter(property => {
        return allowedProperties.indexOf(property) == 1;
    });
    if (foundProperties.length < 1) {
        return response.failure(
            "You can't change these details",
            403,
        );
    }

    next();
}

module.exports = {
    updateClient
};