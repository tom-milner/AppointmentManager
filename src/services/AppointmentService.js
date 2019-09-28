import Api from "@/services/Api.js";

export default {

  // Fetch all available appointments
  getAllAppointments() {
    return Api.get("/appointments");
  },


  // get appointments of a user.
  getAppointmentsOfUser({
    isCounsellor,
    userId,
    fromTime,
    reduced
  }) {

    // initialise parameters
    let params = {};

    // if a fromTime is included add it to the request params.
    if (fromTime) {
      params.fromTime = fromTime;
    }

    // this is the base URL for the appointments endpoint
    let url = "/appointments";

    // if the user is requesting counsellor appointments, append '/counsellor' to the url to request counsellor appointments.
    if (isCounsellor) {
      url += "/counsellor";

      // if the user wants full appointments (more detail) append 'full'
      if (!reduced) {
        url += "/full"
      }

      // use is requesting client (normal user) appointments
    } else {
      url += "/client"
    }

    // append the userId to the url, to specify which user you want to get the appointments of.
    url += `/${userId}`;
    return Api.get(url, {
      params: params
    })

  },

  // request an appointment
  requestAppointment(appointment) {
    return Api.post("/appointments",
      appointment
    );
  },

  // sends the updated state of the appointment to the server
  updateAppointment(appointmentProperties, appointmentId) {
    return Api.post(`/appointments/update/${appointmentId}`, {
      appointmentProperties: appointmentProperties
    });
  },


}