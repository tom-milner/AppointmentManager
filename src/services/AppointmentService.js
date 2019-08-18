import Api from "@/services/Api.js";

export default {

  // Fetch all available appointments
  getAllAppointments() {
    return Api.get("/appointments");
  },


  // Get appointments of client
  getAppointmentsOfClient(userId) {
    return Api.get(`/appointments/client/${userId}`);
  },

  // Get appointments of counsellor
  getReducedAppointmentsOfCounsellor(userId) {
    return Api.get(`/appointments/counsellor/${userId}`);
  },

  // get full detail appointments of counsellor
  getFullAppointmentsOfCounsellor(userId) {
    return Api.get(`/appointments/admin/counsellor/${userId}`)
  },

  // request an appointment
  requestAppointment(appointment) {
    return Api.post("/appointments",
      appointment
    );
  },

  // sends the updated state of the appointment to the server
  updateAppointment(appointmentProperties) {
    return Api.post("appointments/update", appointmentProperties);
  }
}