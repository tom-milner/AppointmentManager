// Import required models
const AppointmentTypeModel = require("../models/MongooseModels/AppointmentTypeModel");
const ErrorController = require("../controllers/ErrorController");

// create a new appointment type
async function createAppointmentType(req, res) {
  try {
    let name = req.body.name;
    let duration = req.body.duration;
    // create new appointment type
    let newAppointmentType = new AppointmentTypeModel({
      name: name,
      duration: duration
    });

    let createdAppointmentType = await newAppointmentType.save();

    // appointment type created successfully - return it 
    res.status(200).send({
      appointmentType: createdAppointmentType,
      success: true,
      message: "Appointment type created successfully."
    });

  } catch (error) {
    let responseCode = error.code || 500;
    let errorMessage = error.message || "Error creating appointment type.";

    if (error.code == 11000) {
      errorMessage = "Appointment Type name already exists.";
      responseCode = 200;
    }

    ErrorController.sendError(res, errorMessage, responseCode);

  }
}

// get all the different types of appointment
async function getAllAppointmentTypes(req, res) {
  try {
    let appointmentTypes = await AppointmentTypeModel.find({});
    res.status(200).send({
      success: true,
      message: "Appointment types returned successfully",
      appointmentTypes: appointmentTypes
    })
  } catch (error) {
    console.log(error);
    let errorMessage = error.message || "Error getting appointment types.";
    ErrorController.sendError(res, errorMessage, 500);
  }
}

// function called by counsellor to change appointment type details.
async function updateAppointmentType(req, res) {
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
    res.status(200).send({
      success: true,
      message: "Appointment type updated successfully",
      updatedAppointmentType: updatedAppointmentType
    });

  } catch (error) {
    let errorMessage = error.message || "Error updating appointment type.";
    let errorCode = error.code || 500;
    ErrorController.sendError(res, errorMessage, errorCode);
  }
}


module.exports = {
  createAppointmentType,
  getAllAppointmentTypes,
  updateAppointmentType
}