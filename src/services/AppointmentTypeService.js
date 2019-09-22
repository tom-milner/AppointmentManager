  import Api from "@/services/Api";

  export default {
    // Appointment Type Service
    getAppointmentTypes() {
      return Api.get("/appointments/type");
    },

    updateAppointmentType(appointmentTypeId, appointmentTypeSettings) {
      return Api.post(`/appointments/type/update/${appointmentTypeId}`, {
        appointmentTypeProperties: appointmentTypeSettings
      });
    },

    createAppointmentType(typeOptions) {
      return Api.post("/appointments/type", {
        duration: typeOptions.duration,
        name: typeOptions.name
      })
    }
  }