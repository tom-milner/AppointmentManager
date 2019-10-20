const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const ErrorController = require("../ErrorController");
const Utils = require("../../utils/Utils");

// get list of all the counsellors
async function getAllCounsellorsReduced(req, res) {
  try {
    // get all the counsellors but exclude their personal information.
    let counsellorQuery = CounsellorModel.find().select("-email")

    // limit amount of counsellors returned
    const limit = parseInt(req.query.limit);
    if (limit) counsellorQuery.limit(limit);

    const counsellors = await counsellorQuery.exec();
    // make sure counsellors could be found
    if (counsellors.length === 0) {
      throw {
        message: "No counsellors could be found.",
        code: 400
      };
    }

    res.status(200).send({
      success: true,
      message: "Counsellors returned successfully",
      counsellors: counsellors
    });
  } catch (error) {
    console.log(error);

    let errorMessage = error.message || "Error returning counsellors.";
    let errorCode = error.code || 500;

    ErrorController.sendError(res, errorMessage, errorCode);
  }
}

// changing counsellor settings
async function updateCounsellor(req, res) {
  // TODO: create policy

  let counsellorId = req.params.counsellorId;
  let newCounsellorInfo = req.body.counsellorInfo;
  try {

    console.log(newCounsellorInfo);
    let updatedcounsellorInfo = await CounsellorModel.findByIdAndUpdate(
      counsellorId,
      newCounsellorInfo, {
        new: true,
        runValidators: true
      }
    );

    if (!updatedcounsellorInfo) {
      throw {
        message: "Counsellor doesn't exist",
        code: 400
      };
    }
    res.status(200).send({
      success: true,
      message: "Counsellor settings updated."
    });
  } catch (error) {
    // send an appropriate error message.
    let errorMessage = error.message || "Error updating counsellor settings";
    let errorCode = error.code || 400;
    if (errorCode == 11000) {
      errorMessage = Utils.getDuplicateMongoEntryKey(error.message) +
        " already exists."
    }
    ErrorController.sendError(res, errorMessage, errorCode);
  }
}

function getCounsellor({
  reduced
}) {
  return async function (req, res) {
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

      res.status(200).send({
        message: "Counsellor returned successfully",
        success: true,
        counsellor: counsellor
      });
    } catch (error) {
      console.log(error);
      ErrorController.sendError(res, "Counsellor couldn't be found", 400);
    }
  };
}



module.exports = {
  getAllCounsellorsReduced,
  updateCounsellor,
  getCounsellor
};