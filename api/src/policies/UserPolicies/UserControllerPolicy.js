const Joi = require("joi");
const Utils = require("../../utils/Utils");
const AppResponse = require("../../struct/AppResponse");


/**
 * This function verifies that a request attempting to fetch a list of users is valid.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
function getReducedUsers(req, res, next) {
    const response = new AppResponse(res);

    const joiSchema = {
        userIds: Joi.string().required(),
    }

    const {
        error,
        value
    } = Joi.validate(req.query, joiSchema);


    if (error) {
        let errorMessage = "";
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