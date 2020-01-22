  import Api from "@/services/Api";

  export default {
      // Appointment Type Service
      getAppointmentTypes() {
          return Api.get("/appointments/type");
      },

      updateAppointmentType(appointmentTypeId, appointmentTypeSettings) {
          return Api.post(`/appointments/type/${appointmentTypeId}`, {
              appointmentTypeProperties: appointmentTypeSettings
          });
      },

      createAppointmentType(typeOptions) {
          return Api.post("/appointments/type", typeOptions)
      },

      deleteAppointmentType(appointmentTypeId) {
          return Api.post(`/appointments/type/delete/${appointmentTypeId}`);
      }
  }