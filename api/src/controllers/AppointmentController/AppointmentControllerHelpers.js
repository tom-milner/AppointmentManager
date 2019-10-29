const CounsellorModel = require("../../models/MongooseModels/UserModels/CounsellorModel");
const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppointmentTypeModel = require("../../models/MongooseModels/AppointmentTypeModel");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Utils = require("../../utils/Utils");
const MongooseObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");

// ########################################################
// Helper functions - not called directly by route handler
// ########################################################

async function createAndCheckAllAppointments(appointmentInfo, appointmentType) {

    let appointments = [];
    if (appointmentType.isRecurring) {
        // give the recurring series of appointments an ID so that they can be found together easily.
        let recurringSeriesId = new MongooseObjectId();
        appointmentInfo.recurringSeriesId = recurringSeriesId;

        // create the recurrring appointments
        appointments.push(appointmentInfo);

        let originalStart = appointmentInfo.startTime.clone();
        let originalEnd = appointmentInfo.endTime.clone();

        // add the recurring appointments
        for (
            let index = 1; index < appointmentInfo.appointmentType.recurringDuration; index++
        ) {
            let newStart = originalStart.add(1, "week");
            let newEnd = originalEnd.add(1, "week");

            const newAppointment = Object.assign({}, appointmentInfo);
            newAppointment.startTime = moment(newStart);
            newAppointment.endTime = moment(newEnd);
            newAppointment.recurringNo = index;
            // add appointment
            appointments[index] = newAppointment;
        }
    } else {
        // create single appointment
        appointments.push(
            appointmentInfo
        );
    }
    // check that the counsellor and client can make all the appointments.
    for (let appointment of appointments) {
        let {
            startTime,
            endTime,
            counsellorId,
            clientId
        } = appointment;
        let error;
        error = await checkUserAvailability(startTime, endTime, clientId)
        if (error) return ({
            error
        })
        error = await checkUserAvailability(startTime, endTime, counsellorId, true);
        if (error) return ({
            error
        })
    }

    // all appointments are free, so book them;
    return {
        appointments
    };
}

async function insertAppointment(appointmentInfo) {
    // Create new appointment model
    let createdAppointment = AppointmentModel.create({
        title: appointmentInfo.title,
        startTime: appointmentInfo.startTime,
        // TODO: add buffer to end time
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

async function getAppointmentType(typeId) {
    let foundType = await AppointmentTypeModel.findById(typeId);
    if (!foundType) return;
    return foundType;
}

function checkCounsellorIsWorking(counsellor, desiredStartTime, desiredEndTime) {
    // now check to see if the counsellor if available to work at the desired time.
    let availableWorkDays = counsellor.workingDays;

    // get Day string from start time e.g. "Monday" (we're assuming no appointments run over 2 days)
    let requiredDay = desiredStartTime.format("dddd");

    // check counsellor is working on given day.
    let validDay = availableWorkDays.find(day => day.name == requiredDay);

    // if counsellor isn't working that day, return an error
    if (!validDay) {
        return {
            message: `Counsellor is not available on ${requiredDay}.`,
        };
    }
    // Now check if counsellor is working the required hours.
    // create new moment objects for requested day containing the start and end times. The moment objects are needed for reliable comparison.
    let startOfDay = Utils.getMomentFromTimeString(
        desiredStartTime,
        validDay.startTime
    );
    let endOfDay = Utils.getMomentFromTimeString(
        desiredEndTime,
        validDay.endTime
    );

    // check start and end times are valid (Counsellor is working on during the requested appointment time.).
    let timeIsValid =
        desiredStartTime.isBetween(startOfDay, endOfDay, null, []) &&
        desiredEndTime.isBetween(startOfDay, endOfDay, null,
            []); // AND operation - counsellor must be free for both the start and end.
    // If the required time isn't valid, return an error.
    if (!timeIsValid) {
        return {
            message: "Counsellor is not working at that time",
        };
    }
}


async function checkUserAvailability(desiredStartTime, desiredEndTime, userId, isCounsellor) {


    // first make sure the client exists
    let validUser = isCounsellor ? await CounsellorModel.findById(userId) : await UserModel.findById(userId);

    if (!validUser) {
        return {
            message: "User doesn't exist",
        };
    }

    // Now we know that the counsellor is working during the requested times, we need to check to see if the desired time clashes with any other appointments.
    let appointmentQuery = AppointmentModel.find();

    if (isCounsellor) {
        let error = checkCounsellorIsWorking(validUser, desiredStartTime, desiredEndTime);
        if (error) return error;
        appointmentQuery.where({
            counsellorId: userId
        });
    } else {
        appointmentQuery.where({
            clients: userId
        });
    }

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

    let clashingAppointments = await appointmentQuery.exec();

    // if any clashing appointments are found, reject the new appointment
    if (clashingAppointments.length > 0) {
        let clashInfo = createClashInfo(clashingAppointments);

        return {
            message: `${isCounsellor? "Counsellor" : "Client" } is not available at this time.`,
            clashInfo: clashInfo,
        };
    }
}

function createClashInfo(clashingAppointments) {
    let clashInfo = [];
    for (let appointment of clashingAppointments) {
        if (appointment.appointmentType.isRecurring) {
            clashInfo.push({
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                noFutureAppointments: appointment.appointmentType.recurringDuration - appointment
                    .recurringNo
            });
        }
    }
    return clashInfo;
}

module.exports = {
    getAppointmentType,
    insertAppointment,
    createAndCheckAllAppointments
};