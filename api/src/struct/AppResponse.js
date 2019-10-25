const Logger = require("./Logger")(module);

class AppResponse {

    constructor(res) {
        this.response = res;
    }

    success(message, payload, statusCode) {

        let responseObject = {
            success: true,
            message: message
        }

        if (payload) {
            // add payload to errorObject
            let keys = Object.keys(payload);
            for (let key of keys) {
                if (key == "success" || key == "message") break;
                responseObject[key] = payload[key]
            }
        }
        this.response.status(statusCode || 200).send(responseObject);
    }

    failure(errorMessage, statusCode, payload) {

        if (statusCode < 100 || statusCode > 598) {
            Logger.error("Invalid status code!", errorMessage);
        }

        // create error object
        let errorObject = {
            success: false,
            message: errorMessage || "Server error.",
        }

        if (payload) {
            // add payload to errorObject
            let keys = Object.keys(payload);
            for (let key of keys) {
                if (key == "success" || key == "message") break;
                errorObject[key] = payload[key]
            }
        }

        // send error 
        this.response.status(statusCode).send(errorObject)
    }

}

module.exports = AppResponse;