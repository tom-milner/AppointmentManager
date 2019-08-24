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

    console.log(isCounsellor);
    let params = {};
    if (fromTime) {
      params.fromTime = fromTime;
    }
    let url = "/appointments";
    if (isCounsellor) {
      url += "/counsellor";
      if (!reduced) {
        url += "/full"
      }
    } else {
      url += "/client"
    }
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
    return Api.post(`appointments/update/${appointmentId}`, {
      appointmentProperties: appointmentProperties
    });
  }
}