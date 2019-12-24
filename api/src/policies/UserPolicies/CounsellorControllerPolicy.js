const AppResponse = require("../../struct/AppResponse");

function updateCounsellor(req, res, next) {
    const response = new AppResponse(res);

    // check if the object is present
    let counsellorInfo = req.body.counsellorInfo;
    if (!counsellorInfo) return response.failure("No info found", 400);

    // If the counsellor is checking their working hours, make sure the start times are before the end times.
    if (counsellorInfo.workingDays) {
        const invalidStartTime = counsellorInfo.workingDays.some(day => {
            // turn times into integer values  -  e.g. "23:00" -> 2300
            let start = parseInt(day.startTime.replace(":", ""));
            let end = parseInt(day.endTime.replace(":", ""));
            if (start >= end) return true;
        });

        if (invalidStartTime) {
            return response.failure("Day start times must be before day end times.", 400);
        }
    }

    next();
}

module.exports = {
    updateCounsellor
};
