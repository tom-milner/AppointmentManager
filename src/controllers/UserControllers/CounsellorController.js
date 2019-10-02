const CounsellorModel = require("../../models/MongooseModels/CounsellorModel");
const ErrorController = require("../ErrorController");

// get list of all the counsellors 
async function getAllCounsellorsReduced(req, res) {
  try {
    // get all the counsellors but exclude their personal information.
    let counsellors = await CounsellorModel.find({}, {
      email: 0,
      type: 0
    });
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

    let errorMessage = error.message || "Error returning counsellors."
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
    let errorMessage = error.message || 400;
    let errorCode = error.code || "Error updating counsellor settings";
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
      if (reduced) counsellor = {
        firstname: counsellor.firstname,
        lastname: counsellor.lastname,
        _id: counsellor._id,
        workingDays: counsellor.workingDays
      };

      res.status(200).send({
        message: "Counsellor returned successfully",
        success: true,
        counsellor: counsellor,
      });
    } catch (error) {

      console.log(error);
      ErrorController.sendError(res, "Counsellor couldn't be found", 400);

    }
  }
}


module.exports = {
  getAllCounsellorsReduced,
  updateCounsellor,
  getCounsellor,
}