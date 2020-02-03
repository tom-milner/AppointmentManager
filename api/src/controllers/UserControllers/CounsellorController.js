const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const CounsellorRegistrationModel = require("../../models/MongooseModels/CounsellorRegistrationModel");
const AuthenticationControllerHelpers = require("../AuthenticationController/AuthenticationControllerHelpers");
const AppResponse = require("../../struct/AppResponse");
const Utils = require("../../utils/Utils");
const Mailer = require("../../struct/mailer/Mailer");
const bcrypt = require("bcrypt");
const Logger = require("../../struct/Logger");
const ErrorCodes = require("../../models/ErrorCodes");

/**
 * Get a list of all the counsellors in reduced form.
 * NOTE: there isn't a method of getting a detailed list of all the counsellors.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 */
async function getAllCounsellorsReduced(req, res) {
  const response = new AppResponse(res);

  try {
    // Get all the counsellors but exclude their personal information.
    let counsellorQuery = CounsellorModel.find().select("-email");

    // Limit amount of counsellors returned
    if (req.query.limit) counsellorQuery.limit(parseInt(req.query.limit));
    // NOTE: there is no need to make sure that 'req.query.limit' is valid number. If it isn't a valid number 'parseInt(req.query.limit)' will evaluate to 'NaN' (not a number).
    // When 0 (or NaN) is supplied to the limit function, MongoDB will act as if no limit has been set (as described in the MongoDB docs https://docs.mongodb.com/manual/reference/method/cursor.limit/).
    // Therefore the limit will be ignored if it's a number.

    // Execute the query.
    const counsellors = await counsellorQuery.exec();

    // Make sure counsellors could be found.
    if (counsellors.length === 0) return response.failure("No counsellors could be found.", 200);

    return response.success("Counsellors returned successfully", {
      amount: counsellors.length, // The amount of counsellors that were returned.
      counsellors: counsellors
    });
  } catch (error) {
    Logger.error("Error getting counsellors.", error);
    return response.failure("Error returning counsellors.", 500);
  }
}

/**
 * This function updates a counsellor's details.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 */
async function updateCounsellor(req, res) {
  const response = new AppResponse(res);

  let counsellorId = req.params.counsellorId;
  let newCounsellorInfo = req.body.counsellorInfo;

  // We don't have to worry about validating the user's input as CounsellorControllerPolicy.js runs all the validation checks.
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
    if (errorCode == ErrorCodes.MONGO_DUPLICATE_KEY) {
      errorMessage = Utils.getDuplicateMongoEntryKey(error.message) + " already exists.";
    }
    return response.failure(errorMessage, errorCode);
  }
}

/**
 * Fetch a specific counsellor from the database using their ID.
 * @param {boolean} reduced - Whether or not to return reduced information about the counsellor.
 */
function getCounsellor({ reduced }) {
  return async function(req, res) {
    const response = new AppResponse(res);
    let counsellorId = req.params.counsellorId;

    try {
      // get the counsellor.
      let counsellor = await CounsellorModel.findById(counsellorId);

      // If we need to return a reduced object, recreate the counsellor object with the reduced info.
      if (reduced) {
        counsellor = {
          firstname: counsellor.firstname,
          lastname: counsellor.lastname,
          _id: counsellor._id,
          workingDays: counsellor.workingDays,
          appointmentBufferTime: counsellor.appointmentBufferTime
        };
      }

      return response.success("Counsellor returned successfully", {
        counsellor: counsellor
      });
    } catch (error) {
      return response.failure("Counsellor couldn't be found", 400);
    }
  };
}

/**
 * This function sends an email to a specified user that contains a link that they can use to create a counsellor account.
 * @param {{}} req - The request details.
 * @param {{}} res - The response details.
 */
async function sendNewCounsellorEmail(req, res) {
  const response = new AppResponse(res);
  const { email, counsellorPassword } = req.body;

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
    if (error.code == ErrorCodes.MONGO_DUPLICATE_KEY)
      return response.failure("This user has already been sent a registration email.", 400);

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
