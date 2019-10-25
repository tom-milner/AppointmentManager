const Joi = require("joi");
const Utils = require("../../utils/Utils");
const AppResponse = require("../../struct/AppResponse");


function getReducedUsers(req, res, next) {
    const response = new AppResponse(res);

    const joiSchema = {
        userIds: Joi.string().required(),
    }

    try {
        const {
            error,
            value
        } = Joi.validate(req.query, joiSchema);

        let errorMessage = "";
        let errorCode = 400;

        if (error) {
            switch (error.details[0].context.key) {
                case "userIds":
                    errorMessage = "No user ids found.";
                    break;
                default:
                    errorMessage = error.details[0].message;
                    break;
            }
            throw ({
                message: errorMessage,
                code: 400
            });

        }

        // check ids
        let userIds = value.userIds.split(",").filter(Boolean);
        console.log(userIds);
        let invalidIds = userIds.some(id => {
            console.log(!Utils.validateMongoId(id));
            return !Utils.validateMongoId(id);
        })
        if (invalidIds) {
            throw ({
                message: "Invalid user ids",
                code: 400
            });
        }
        // all is good
        next();
    } catch (error) {
        return response.failure(error.message || "Error getting users Ids", error.code || 400)
    }
}

module.exports = {
    getReducedUsers
}