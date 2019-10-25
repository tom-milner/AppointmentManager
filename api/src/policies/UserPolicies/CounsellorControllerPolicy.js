const AppResponse = require("../../struct/AppResponse");

function updateCounsellor(req, res, next) {
    const response = new AppResponse(res);

    try {
        // Joi isn't needed - we only need to check if the object is present
        let counsellorInfo = req.body.counsellorInfo;
        if (!counsellorInfo) {
            throw ({
                message: "No info found",
                code: 400
            });
        }

        next();
    } catch (error) {
        // send an error to the user.
        let errorMessage = error.message || "Error updating counsellor settings.";
        let errorCode = error.code || 400;
        return response.failure(errorMessage, errorCode);
    }
}



module.exports = {
    updateCounsellor
}