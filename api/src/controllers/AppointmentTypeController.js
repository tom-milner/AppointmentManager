// Import required models
const AppointmentTypeModel = require("../models/MongooseModels/AppointmentTypeModel");
const AppResponse = require("../struct/AppResponse");
const Utils = require("../utils/Utils");

// create a new appointment type
async function createAppointmentType(req, res) {
  const response = new AppResponse(res);
  try {
    let name = req.body.name;
    let duration = req.body.duration;
    let description = req.body.description;
    let isRecurring = req.body.isRecurring;
    let recurringDuration = req.body.recurringDuration;



    // create new appointment type
    let newAppointmentType = new AppointmentTypeModel({
      name: name,
      duration: duration,
      description: description,
      isRecurring: isRecurring,
      recurringDuration: recurringDuration
    });

    let createdAppointmentType = await newAppointmentType.save();

    // appointment type created successfully - return it 
    return response.success("Appointment type created successfully.", {
      appointmentType: createdAppointmentType,
    });

  } catch (error) {
    let responseCode = error.code || 500;
    let errorMessage = error.message || "Error creating appointment type.";
    if (error.code === 11000) {
      errorMessage = Utils.getDuplicateMongoEntryKey(errorMessage) +
        " already exists.";
      responseCode = 200;
    }
    return response.failure(errorMessage, responseCode);

  }
}

// get all the different types of appointment
async function getAllAppointmentTypes(req, res) {
  const response = new AppResponse(res);
  try {
    let appointmentTypes = await AppointmentTypeModel.find({});
    return response.success("Appointment types returned successfully", {
      appointmentTypes: appointmentTypes
    })
  } catch (error) {
    console.log(error);
    let errorMessage = error.message || "Error getting appointment types.";
    return response.failure(errorMessage, 500);
  }
}

// function called by counsellor to change appointment type details.
async function updateAppointmentType(req, res) {
  let response = new AppResponse(res);
  try {
    const newAppointmentTypeProperties = req.body.appointmentTypeProperties;
    const appointmentTypeId = req.params.appointmentTypeId;
    console.log(req.body);
    let updatedAppointmentType = await AppointmentTypeModel.findByIdAndUpdate(
      appointmentTypeId,
      newAppointmentTypeProperties, {
        new: true,
        runValidators: true
      }
    );
    // This check is in the controller, not the policy. This is because checking the existence of the appointment type has to involve querying the database for it, and doing that twice would require unnecessary computing.
    if (!updatedAppointmentType) {
      throw ({
        message: "Appointment Type doesn't exist",
        code: 400
      });
    }

    // appointment type updated successfully
    return response.success("Appointment type updated successfully", {
      updatedAppointmentType: updatedAppointmentType
    });

  } catch (error) {
    let errorMessage = error.message || "Error updating appointment type.";
    let errorCode = error.code || 400;
    if (errorCode == 11000) {
      errorMessage = Utils.getDuplicateMongoEntryKey(errorMessage) + "Appointment Type name already exists.";
      errorCode = 200;
    }
    return response.failure(errorMessage, errorCode);
  }
}

async function deleteAppointmentType(req, res) {
  const response = new AppResponse(res);
  let appointmentTypeId = req.params.appointmentTypeId;

  try {
    let model = await AppointmentTypeModel.findByIdAndRemove(appointmentTypeId);
    console.log(model);

    return response.success("Appointment Type deleted successfully.");
  } catch (error) {
    let errorMessage = error.message || "Error deleting appointment type.";
    let errorCode = error.code || 500;
    return response.failure(errorMessage, errorCode);

  }
}


module.exports = {
  createAppointmentType,
  getAllAppointmentTypes,
  updateAppointmentType,
  deleteAppointmentType
}