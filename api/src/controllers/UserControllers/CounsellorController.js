const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const CounsellorRegistrationModel = require("../../models/MongooseModels/CounsellorRegistrationModel");
const AuthenticationControllerHelpers = require("../AuthenticationController/AuthenticationControllerHelpers");
const AppResponse = require("../../struct/AppResponse");
const Utils = require("../../utils/Utils");
const Mailer = require("../../struct/mailer/Mailer");
const bcrypt = require("bcrypt");
const Logger = require("../../struct/Logger")(module);

// get list of all the counsellors
async function getAllCounsellorsReduced(req, res) {
    const response = new AppResponse(res);

    try {
        // get all the counsellors but exclude their personal information.
        let counsellorQuery = CounsellorModel.find().select("-email");

        // limit amount of counsellors returned
        const limit = parseInt(req.query.limit);
        if (limit) counsellorQuery.limit(limit);

        const counsellors = await counsellorQuery.exec();

        // make sure counsellors could be found
        if (counsellors.length === 0) return response.failure("No counsellors could be found.", 200);

        return response.success("Counsellors returned successfully", {
            counsellors: counsellors
        });
    } catch (error) {
        Logger.error("Error getting Counsellors.", error);
        return response.failure("Error returning counsellors.", 500);
    }
}

// changing counsellor settings
async function updateCounsellor(req, res) {
    const response = new AppResponse(res);

    let counsellorId = req.params.counsellorId;
    let newCounsellorInfo = req.body.counsellorInfo;
    try {
        let updatedcounsellorInfo = await CounsellorModel.findByIdAndUpdate(counsellorId, newCounsellorInfo, {
            new: true,
            runValidators: true
        });

        if (!updatedcounsellorInfo) return response.failure("Counsellor doesn't exist", 400);

        return response.success("Counsellor settings updated.");
    } catch (error) {
        // send an appropriate error message.
        let errorMessage = error.message || "Error updating counsellor settings";
        let errorCode = error.code || 400;
        if (errorCode == 11000) {
            errorMessage = Utils.getDuplicateMongoEntryKey(error.message) + " already exists.";
        }
        return response.failure(errorMessage, errorCode);
    }
}

function getCounsellor({ reduced }) {
    return async function(req, res) {
        const response = new AppResponse(res);
        let counsellorId = req.params.counsellorId;

        try {
            // get the counsellor.
            let counsellor = await CounsellorModel.findById(counsellorId);

            // If we need to return a reduced object, recreate the counsellor object with the required data.
            if (reduced)
                counsellor = {
                    firstname: counsellor.firstname,
                    lastname: counsellor.lastname,
                    _id: counsellor._id,
                    workingDays: counsellor.workingDays,
                    appointmentBufferTime: counsellor.appointmentBufferTime
                };

            return response.success("Counsellor returned successfully", {
                counsellor: counsellor
            });
        } catch (error) {
            return response.failure("Counsellor couldn't be found", 400);
        }
    };
}

async function sendNewCounsellorEmail(req, res) {
    const response = new AppResponse(res);
    const { email, counsellorPassword } = req.body;

    if (!email) return response.failure("No email provided", 400);
    if (!counsellorPassword) return response.failure("No password provided.", 400);

    // check against password against hash in database
    const passwordHash = (await CounsellorModel.findById(req.user._id).select("password")).password;
    const isPasswordValid = await bcrypt.compare(counsellorPassword, passwordHash);

    if (!isPasswordValid) return response.failure("Invalid password", 403);

    // check user isn't already a counsellor.
    let existingCounsellor = await CounsellorModel.find(
        {
            email: email
        },
        {
            email: 1
        }
    ).limit(1)[0];

    if (existingCounsellor) return response.failure("Counsellor already exists", 400);

    // create a temporary token
    const token = await AuthenticationControllerHelpers.generateRandomToken();

    try {
        // save token hash in db
        await CounsellorRegistrationModel.create({
            hash: await AuthenticationControllerHelpers.generateTokenHash(token),
            email: email,
            timestamp: Date.now()
        });

        // send the email to the user.
        let mailer = new Mailer();
        mailer.newCounsellorEmail(req.user, email, token).send();

        return response.success("Email sent successfully");
    } catch (error) {
        if (error.code == 11000) return response.failure("This user has already been sent a registration email.", 400);

        Logger.error("Error sending email.", error);
        return response.failure("Error sending email", 500);
    }
}

module.exports = {
    getAllCounsellorsReduced,
    updateCounsellor,
    sendNewCounsellorEmail,
    getCounsellor
};
