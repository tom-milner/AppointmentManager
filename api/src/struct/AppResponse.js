// This is the response handler for every request. All the responses are piped through this file so that they are standardised.

const Logger = require("./Logger");

class AppResponse {
  constructor(res) {
    // Attach the response data to the class.
    this.response = res;
  }
  /**
   * This function returns a successfull response to the requesting device.
   * @param {String} message - The message to include in the request.
   * @param {{}} payload - The payload to send with the response.
   * @param {Number} statusCode - (Optional) The status code to send the request with.
   */
  success(message, payload, statusCode) {
    let responseObject = {
      success: true,
      message: message
    };

    // Add top level items of the payload to the response.
    if (payload) responseObject = mergePayload(payload, responseObject);

    // Set the response status and send the response.
    this.response.status(statusCode || 200).send(responseObject);
  }

  /**
   * This function returns a failed response to the requesting device.
   * @param {String} errorMessage - The error message to send to the requesting device.
   * @param {Number} statusCode - The status code to send the response with.
   * @param {{}} payload - (Optional) Any useful information that regards the error.
   */
  failure(errorMessage, statusCode, payload) {
    // Make sure the supplied status code is valid.
    if (statusCode < 100 || statusCode > 598 || isNaN(parseInt(statusCode))) {
      Logger.error("Invalid status code!", {
        errorMessage,
        statusCode
      });
    }
    // Create error object
    let errorObject = {
      success: false,
      message: errorMessage || "Server error."
    };
    // Add top level items of the payload to the response.
    if (payload) errorObject = mergePayload(payload, errorObject);

    // Set status and send response.
    this.response.status(statusCode).send(errorObject);
  }
}

/**
 * This function adds the top level of a payload object into the response object.
 * @param {{}} payload - The information to merge with the response object.
 * @param {{}} response - The response object to send back to the requeting device.
 */
function mergePayload(payload, response) {
  let keys = Object.keys(payload);
  for (let key of keys) {
    if (key == "success" || key == "message") break;
    response[key] = payload[key];
  }
  return response;
}

module.exports = AppResponse;
