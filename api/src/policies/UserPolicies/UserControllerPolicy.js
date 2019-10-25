const Joi = require("joi");
const Utils = require("../../utils/Utils");
const AppResponse = require("../../struct/AppResponse");


function getReducedUsers(req, res, next) {
    const response = new AppResponse(res);

    const joiSchema = {
        userIds: Joi.string().required(),
    }

    const {
        error,
        value
    } = Joi.validate(req.query, joiSchema);

    let errorMessage = "";

    if (error) {
        switch (error.details[0].context.key) {
            case "userIds":
                errorMessage = "No user ids found.";
                break;
            default:
                errorMessage = error.details[0].message;
                break;
        }
        return response.failure(
            errorMessage,
            400
        );

    }

    // check ids
    let userIds = value.userIds.split(",").filter(Boolean);
    let invalidIds = userIds.some(id => {
        return !Utils.validateMongoId(id);
    })
    if (invalidIds) return response.failure(
        "Invalid user ids",
        400
    );

    // all is good
    next();

}

module.exports = {
    getReducedUsers
}