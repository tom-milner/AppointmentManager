import Api from "@/services/Api.js";

export default {

  // Fetch all available appointments
  getAllAppointments() {
    return Api().get("/appointments");
  }
}