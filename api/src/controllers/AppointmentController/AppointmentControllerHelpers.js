const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const MongooseObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");
const Roles = require("../../models/Roles");

/*
    NOTE: These functions are here as they are not called directly by the route handler.
*/

/**
 * Check if an appointment is available. If the appointment is recurring, it will create and check all the future appointments aswell.
 * @param {{}} appointmentInfo - an object containing all the appointment information.
 * @returns {{}} {appointments, error} - An object containing either an error or a list of valid appointments.
 */
async function checkAllAppointments(appointmentInfo) {
    let appointments = [];
    // add first appointment of series.
    appointmentInfo.startTime = moment(appointmentInfo.startTime);
    appointmentInfo.endTime = moment(appointmentInfo.endTime);
    appointments.push(appointmentInfo);

    if (appointmentInfo.appointmentType.isRecurring) {
        // give the recurring series of appointments an ID so that they can be found together easily.
        if (!appointmentInfo.recurringSeriesId) appointmentInfo.recurringSeriesId = new MongooseObjectId();

        let originalStart = appointmentInfo.startTime.clone();
        let originalEnd = appointmentInfo.endTime.clone();

        // add the recurring appointments
        for (let index = 1; index < appointmentInfo.appointmentType.recurringDuration; index++) {
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
            error = await checkUserAvailability(startTime, endTime, clientId);
            if (error)
                return {
                    error
                };
        }
        // check the counsellor is available for the appointments.
        error = await checkUserAvailability(startTime, endTime, counsellorId);
        if (error)
            return {
                error
            };
    }
    // All appointments are free, so book them;
    return {
        appointments
    };
}

/**
 * Check that a counsellor is working on the day and time of an appointment.
 * @param {[]]} workingDays - An array of the days the counsellor is working. 
 * @param {moment} desiredStartTime - The desired start time of the appointment.
 * @param {moment} desiredEndTime - The desired end time of the appointment.
 * @returns {{}} An object containing an error message to be sent back to the user.
 */
function checkCounsellorIsWorking(workingDays, desiredStartTime, desiredEndTime) {

    // get Day string from start time e.g. "Monday" (we're assuming no appointments run over 2 days)
    let requiredDay = desiredStartTime.format("dddd");

    // check counsellor is working on given day.
    let validDay = workingDays.find(day => day.name == requiredDay);

    // if counsellor isn't working that day, return a relevant error message.
    if (!validDay) {
        return {
            message: `Counsellor is not available on ${requiredDay}.`
        };
    }

    // Now check if counsellor is working the required hours.

    // Turn the times into integer values for comparison.
    let startOfDay = parseInt(validDay.startTime.replace(":", ""));
    let endOfDay = parseInt(validDay.endTime.replace(":", ""));
    desiredStartTime = parseInt(desiredStartTime.format("HHmm"));
    desiredEndTime = parseInt(desiredEndTime.format("HHmm"));


    // check start and end times are valid (Counsellor is working on during the requested appointment time.).
    // check that the desired start and end times are inbetween the counsellor's working start and end days for the appointment.
    let timeIsValid =
        desiredStartTime >= startOfDay && desiredStartTime <= endOfDay &&
        desiredEndTime >= startOfDay && desiredEndTime <= endOfDay
    // AND operation - counsellor must be free for both the start and end.

    // If the required times aren't valid, return an error.
    if (!timeIsValid) {
        return {
            message: "Counsellor is not working at that time"
        };
    }

    // If we reach here the desired times are all fine, so we don't need to return anything.
}


/**
 * Check that a given user is free for an appointment. (There are no clashes with any other appointments)
 * @param {moment} desiredStartTime - The desired start time of the appointment.
 * @param {moment} desiredEndTime - The desired end time of the appointment.
 * @param {String} userId - The id of the user to check the availability of.
 */
async function checkUserAvailability(desireIndStartTime, desiredEndTime, userId) {
    // first make sure the client exists
    let validUser = await UserModel.findById(userId);
    if (!validUser) {
        return {
            message: "User doesn't exist"
        };
    }

    let appointmentQuery = AppointmentModel.find();

    // If the supplied user is a counsellor, make sure they are working on the requested day.
    const isCounsellor = validUser.role >= Roles.COUNSELLOR;
    if (isCounsellor) {
        let error = checkCounsellorIsWorking(validUser.workingDays, desiredStartTime, desiredEndTime);
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
            clashInfo: clashInfo
        };
    }
}

/**
 * Create reduced info about a list of clashing appointments.
 * @param {[]]} clashingAppointments - A list of appointments that clash with the chosen appointment.
 * @returns {{}} clashInfo - An object containing reduced information about the clashing appointments.
 */
function createClashInfo(clashingAppointments) {
    let clashInfo = [];
    for (let appointment of clashingAppointments) {
        clashInfo.push({
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            // The number of future appointments at the requested time.
            noFutureAppointments: appointment.isRecurring ? appointment.appointmentType.recurringDuration -
                appointment.recurringNo : 0
        });
    }
    return clashInfo;
}

// Expose the checkAllAppointments function.
module.exports = {
    checkAllAppointments
};