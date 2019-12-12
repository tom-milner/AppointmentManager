const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppointmentTypeModel = require("../../models/MongooseModels/AppointmentTypeModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Utils = require("../../utils/Utils");
const MongooseObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");
const Role = require("../../models/Role");

// ########################################################
// Helper functions - not called directly by route handler
// ########################################################


// Check if an appointment is available.
async function checkAllAppointments(appointmentInfo) {

    let appointments = [];
    // add first appointment of series.
    appointments.push(appointmentInfo);

    if (appointmentInfo.appointmentType.isRecurring) {
        // give the recurring series of appointments an ID so that they can be found together easily.
        if (!appointmentInfo.recurringSeriesId) appointmentInfo.recurringSeriesId = new MongooseObjectId();


        appointmentInfo.startTime = moment(appointmentInfo.startTime);
        appointmentInfo.endTime = moment(appointmentInfo.endTime);

        let originalStart = appointmentInfo.startTime.clone();
        let originalEnd = appointmentInfo.endTime.clone();

        // add the recurring appointments
        for (
            let index = 1; index < appointmentInfo.appointmentType.recurringDuration; index++
        ) {
            let newStart = originalStart.add(1, "week");
            let newEnd = originalEnd.add(1, "week");

            // Here I use Object.assign to create  a new instance of the appointmentInfo object.
            // This is because the moment library mutates the original instance of a date, and uses pass by reference.
            // Without Object.assign, every appointment would have the same start and end dates. (Which would be the times of the last appointment in the recurring series)
            const newAppointment = Object.assign({}, appointmentInfo);
            newAppointment.startTime = moment(newStart);
            newAppointment.endTime = moment(newEnd);
            newAppointment.recurringNo = index;
            // add appointment
            appointments[index] = newAppointment;
        }
    }

    // check that the counsellor and client can make all the appointments.
    for (let appointment of appointments) {
        let {
            startTime,
            endTime,
            counsellorId,
            clients
        } = appointment;



        let error;
        for (let clientId of clients) {
            // Check each client is free for the appointment.
            error = await checkUserAvailability(startTime, endTime, clientId)
            if (error) return ({
                error
            })
        }
        // check the counsellor is available for the appointments.
        error = await checkUserAvailability(startTime, endTime, counsellorId);
        if (error) return ({
            error
        })
    }
    // All appointments are free, so book them;
    return {
        appointments
    };
}

async function insertAppointment(appointmentInfo) {

    // Create new appointment model
    let createdAppointment = await AppointmentModel.create({
        title: appointmentInfo.title,
        startTime: appointmentInfo.startTime,
        endTime: appointmentInfo.endTime,
        appointmentType: appointmentInfo.appointmentType,
        // This is an array as I plan on adding support for multiple clients. This is an extension objective.
        clients: [appointmentInfo.clientId],
        isApproved: false,
        counsellorId: appointmentInfo.counsellorId,
        clientNotes: appointmentInfo.clientNotes,
        counsellorNotes: appointmentInfo.counsellorNotes,
        recurringSeriesId: appointmentInfo.recurringSeriesId,
        recurringNo: appointmentInfo.recurringNo
    });
    return createdAppointment;
}



// TODO: This can be refactored to use an array of times.
function checkCounsellorIsWorking(counsellor, desiredStartTime, desiredEndTime) {
    let availableWorkDays = counsellor.workingDays;

    // get Day string from start time e.g. "Monday" (we're assuming no appointments run over 2 days)
    let requiredDay = desiredStartTime.format("dddd");

    // check counsellor is working on given day.
    let validDay = availableWorkDays.find(day => day.name == requiredDay);

    // if counsellor isn't working that day...
    if (!validDay) {
        return {
            message: `Counsellor is not available on ${requiredDay}.`,
        };
    }
    // Now check if counsellor is working the required hours.
    // Create new moment objects for requested day containing the start and end times. The moment objects are needed for reliable comparison.
    let startOfDay = Utils.getMomentOfSameDayFromTimeString(
        desiredStartTime,
        validDay.startTime
    );
    let endOfDay = Utils.getMomentOfSameDayFromTimeString(
        desiredEndTime,
        validDay.endTime
    );

    // check start and end times are valid (Counsellor is working on during the requested appointment time.).
    let timeIsValid =
        desiredStartTime.isBetween(startOfDay, endOfDay, null, []) &&
        desiredEndTime.isBetween(startOfDay, endOfDay, null, []); // AND operation - counsellor must be free for both the start and end.
    // If the required timea aren't valid, return an error.
    if (!timeIsValid) {
        return {
            message: "Counsellor is not working at that time",
        };
    }
}


async function checkUserAvailability(desiredStartTime, desiredEndTime, userId) {


    // first make sure the client exists
    let validUser = await UserModel.findById(userId);
    if (!validUser) {
        return {
            message: "User doesn't exist",
        };
    }

    let appointmentQuery = AppointmentModel.find();

    // If the supplied user is a counsellor, make sure they are working on the requested day.
    if (validUser.role >= Role.Counsellor) {
        let error = checkCounsellorIsWorking(validUser, desiredStartTime, desiredEndTime);
        if (error) return error;
        // look for the user id in the counsellorId field.
        appointmentQuery.where({
            counsellorId: userId
        });
    } else {
        // Look for the user id in the clients field.
        appointmentQuery.where({
            clients: userId
        });
    }
    // Now we know that the counsellor is working during the requested times, we need to check to see if the desired time clashes with any other appointments.


    // Query to find any appointments that clash with the chosen times.
    // It finds any appointments that have a start or end time that is between the requested start and end time.
    appointmentQuery.where({
        $or: [{
            $and: [{
                startTime: {
                    $lte: desiredEndTime
                }
            },
            {
                startTime: {
                    $gte: desiredStartTime
                }
            }
            ]
        },
        {
            $and: [{
                endTime: {
                    $gte: desiredStartTime
                }
            },
            {
                endTime: {
                    $lte: desiredEndTime
                }
            }
            ]
        }
        ]
    });
    // execute the query
    let clashingAppointments = await appointmentQuery.exec();

    // if any clashing appointments are found, reject the requested appointment
    if (clashingAppointments.length > 0) {
        // Create an object containing reduced information about the clashing appointments.
        let clashInfo = createClashInfo(clashingAppointments);

        return {
            message: `${isCounsellor ? "Counsellor" : "Client"} is not available at this time.`,
            clashInfo: clashInfo,
        };
    }
}


// Create reduced info about a list of clashing appointments.
function createClashInfo(clashingAppointments) {
    let clashInfo = [];
    for (let appointment of clashingAppointments) {
        clashInfo.push({
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            // The number of future appointments at the requested time.
            noFutureAppointments: appointment.appointmentType.recurringDuration - appointment
                .recurringNo
        });

    }
    return clashInfo;
}

module.exports = {
    insertAppointment,
    checkAllAppointments
};