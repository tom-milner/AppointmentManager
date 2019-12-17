import Api from "@/services/Api.js";

// Fetch all available appointments - not actually used in production.
function getAllAppointments() {
    return Api.get("/appointments");
}

// get appointments of a user.
function getAppointmentsOfUser({ isCounsellor, userId, reduced, params }) {
    // this is the base URL for the appointments endpoint
    let url = "/appointments";

    // if the user is requesting counsellor appointments, append '/counsellor' to the url to request counsellor appointments.
    if (isCounsellor) {
        url += "/counsellor";

        // use is requesting client (normal user) appointments
    } else {
        url += "/client";
    }

    // if the user wants full appointments (more detail) append 'full'
    if (!reduced) {
        url += "/full";
    }

    // append the userId to the url, to specify which user you want to get the appointments of.
    url += `/${userId}`;
    return Api.get(url, {
        params: params
    });
}

// request an appointment
function requestAppointment(appointment) {
    return Api.post("/appointments", appointment);
}

// sends the updated state of the appointment to the server
function updateAppointment(appointmentProperties, appointmentId) {
    return Api.post(`/appointments/${appointmentId}`, {
        appointmentProperties: appointmentProperties
    });
}

// delete an appointment
function deleteAppointment(appointmentId, deleteRecurring) {
    return Api.post(`/appointments/delete/${appointmentId}`, {
        deleteRecurring: deleteRecurring
    });
}

export default {
    updateAppointment,
    requestAppointment,
    getAppointmentsOfUser,
    getAllAppointments,
    deleteAppointment
};
