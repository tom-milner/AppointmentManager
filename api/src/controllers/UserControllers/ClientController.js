const ClientModel = require("../../models/MongooseModels/UserModels/ClientModel");
const AppResponse = require("../../struct/AppResponse");
const Utils = require("../../utils/Utils");
const ErrorCodes = require("../../models/ErrorCodes");
const Roles = require("../../models/Roles");

/**
 * Get all the clients from the database.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 *
 */
async function getClients(req, res) {
  const response = new AppResponse(res);

  // Get all the clients from the database.
  let clientQuery = ClientModel.find({}).select("username firstname lastname email");

  // If there is a limit specified, limit the amount of clients.
  if (req.query.limit) clientQuery.limit(parseInt(req.query.limit));

  try {
    // Execute the query.
    const allClients = await clientQuery.exec();
    // Return the found clients.
    return response.success("Clients returned successfully.", {
      clients: allClients
    });
  } catch (error) {
    return response.failure("Error finding clients.", 500);
  }
}

/**
 * Get information about a single client.
 * @param {boolean} reduced - Whether or not to return the client information in a reduced form.
 */
function getClient({ reduced }) {
  // Return a function to be used as the handler function. This is so that I can pass variables to this function in the route declaration.
  return async function(req, res) {
    const response = new AppResponse(res);
    let clientId = req.params.clientId;

    // find matching client;
    let client = ClientModel.findById(clientId);

    // If the "reduced" flag is given, only return basic information about the client.
    if (reduced) {
      client.select("firstname lastname");
    } else if (req.user.role >= Roles.COUNSELLOR) {
      // If the requesting user is a counsellor, attach the clinical notes.
      client.select("+clinicalNotes");
    }

    try {
      const foundClient = await client.exec();
      return response.success("Client returned successfully", {
        client: foundClient
      });
    } catch (error) {
      return response.failure("Client couldn't be found.", 404);
    }
  };
}

/**
 * Update an existing client's details.
 * We don't need to perform any input validation here as it is all handled by ClientControllerPolicy.js.
 * @param {{}} req - The request data.
 * @param {{}} res - The response data.
 */
async function updateClient(req, res) {
  const response = new AppResponse(res);

  let clientId = req.params.clientId;
  let newClientInfo = req.body.clientInfo;

  try {
    let updatedClient = await ClientModel.findByIdAndUpdate(clientId, newClientInfo, {
      new: true, // Return the newly created user.
      runValidators: true // Run the validation methods when updating the client.
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

// Export the functions so they can be used.
module.exports = {
  getClients,
  getClient,
  updateClient
};
