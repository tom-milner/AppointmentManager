const AppResponse = require("../../struct/AppResponse");
const Joi = require("joi");


/**
 * This function verifies that a request attempting to update a counsellor's details is valid.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
function updateCounsellor(req, res, next) {
    const response = new AppResponse(res);

    // check if the object is present
    let counsellorInfo = req.body.counsellorInfo;
    if (!counsellorInfo) return response.failure("No info found", 400);

    // If the counsellor is checking their working hours, make sure the start times are before the end times.
    if (counsellorInfo.workingDays) {
        const invalidStartTime = counsellorInfo.workingDays.some(day => {
            // turn times into integer values  -  e.g. "23:00" -> 2300
            if (day.startTime && day.endTime) {
                let start = parseInt(day.startTime.replace(":", ""));
                let end = parseInt(day.endTime.replace(":", ""));
                if (start >= end) return true;
            }
        });

        if (invalidStartTime) {
            return response.failure("Day start times must be before day end times.", 400);
        }
    }

    next();
}


/**
 * This function verifies that a request attempting to send a 'new counsellor' email is valid.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 * @param {{}} next - The next function in the route handler chain.
 */
function sendNewCounsellorEmail(req, res, next) {

    const response = new AppResponse(res);

    const joiSchema = {
        email: Joi.string().email().required(),
        counsellorPassword: Joi.string().required()
    }

    const {
        error
    } = Joi.validate(req.body, joiSchema);
    if (error) {
        let errorMessage = "";
        switch (error.details[0].context.key) {
            case "email":
                errorMessage = "Please provide a valid email.";
                break;
            case "counsellorPassword":
                errorMessage = "Please provide the counsellor's password."
                break;
            default:
                errorMessage = "Error sending counsellor email."
                break;
        }
        return response.failure(errorMessage, 400);
    }

    next();
}

module.exports = {
    updateCounsellor,
    sendNewCounsellorEmail
};