const AppResponse = require("../../struct/AppResponse");

function updateCounsellor(req, res, next) {
    const response = new AppResponse(res);

    try {
        // Joi isn't needed - we only need to check if the object is present
        let counsellorInfo = req.body.counsellorInfo;
        if (!counsellorInfo) return response.failure(
            "No info found",
            400
        );

        next();

    } catch (error) {
        // send an error to the user.
        return response.failure("Error updating counsellor settings.", 500);
    }
}



module.exports = {
    updateCounsellor
}