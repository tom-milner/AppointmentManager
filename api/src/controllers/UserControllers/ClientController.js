const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const AppResponse = require("../../struct/AppResponse");
const Logger = require("../../struct/Logger");
const Utils = require("../../utils/Utils");
const ErrorCodes = require("../../models/ErrorCodes");

// get all the clients
async function getClients(req, res) {
    const response = new AppResponse(res);
    // return all the clients.
    // TODO: implement limits
    const limit = parseInt(req.query.limit);

    let clientQuery = ClientModel.find({}).select("username firstname lastname email");

    if (limit) clientQuery.limit(limit);

    try {
        let allClients = await clientQuery.exec();
        return response.success("Clients returned successfully.", {
            clients: allClients
        });
    } catch (error) {
        return response.failure("Error finding clients.", 500);
    }
}

// get information about a single client.
function getClient({
    reduced
}) {
    return async function (req, res) {
        const response = new AppResponse(res);
        let clientId = req.params.clientId;

        try {
            // find matching client;
            let client = await ClientModel.findById(clientId).select("+clinicalNotes");
            if (reduced)
                client = {
                    firstname: client.firstname,
                    lastname: client.lastname,
                    _id: client._id
                };

            return response.success("Client returned successfully", {
                client: client
            });
        } catch (error) {
            return response.failure("Client couldn't be found.", 404);
        }
    };
}

// update an existing client
async function updateClient(req, res) {
    const response = new AppResponse(res);

    let clientId = req.params.clientId;
    let newClientInfo = req.body.clientInfo;

    try {
        let updatedClient = await ClientModel.findByIdAndUpdate(clientId, newClientInfo, {
            new: true,
            runValidators: true
        });

        if (!updatedClient) return response.failure("Client doesn't exist", 404);

        return response.success("Client updated", {
            updatedClient: updatedClient
        });
    } catch (error) {
        if (error.code == ErrorCodes.MONGO_DUPLICATE_KEY) {
            return response.failure(`${Utils.getDuplicateMongoEntryKey(error.message)} already taken.`, 409);
        }
        return response.failure("Error updating client", 500);
    }
}

module.exports = {
    getClients,
    getClient,
    updateClient
};