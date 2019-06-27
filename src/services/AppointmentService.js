import Api from "@/services/Api.js";

// fetch all available appointments
export default {
  getAllAppointments() {
    return Api().get("/appointments");
  }
}