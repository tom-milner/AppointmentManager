// Import required models
const AppointmentTypeModel = require("../models/MongooseModels/AppointmentTypeModel");
const ErrorController = require("../controllers/ErrorController");

// create a new appointment type
async function createAppointmentType(req, res) {
  try {

    // data validation - don't need seperate function (policy) as we're only checking 2 variables. 
    let duration = req.body.duration;
    let name = req.body.name;

    if (!duration) throw ({
      code: 400,
      message: "Include an appointment type duration."
    });

    if (!name) throw ({
      code: 400,
      message: "Include an appointment type name"
    });

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
function updateAppointmentType(req, res) {
  try {

  } catch (error) {

  }
}


module.exports = {
  createAppointmentType,
  getAllAppointmentTypes,
  updateAppointmentType
}