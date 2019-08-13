import Api from "@/services/Api.js";

export default {

  // Fetch all available appointments
  getAllAppointments() {
    return Api.get("/appointments");
  },

  // TODO: combine these 2 functions.

  // Get appointments of client
  getAppointmentsOfClient(userId) {
    return Api.get(`/appointments/client/${userId}`);
  },

  // Get future appointments of counsellor
  getFutureAppointmentsOfCounsellor(userId) {
    return Api.get(`/appointments/counsellor/${userId}`);
  }
}