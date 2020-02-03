import Api from "@/services/Api";

// Service for interacting with appointment types.
export default {
  getAppointmentTypes() {
    return Api.get("/appointments/type");
  },

  updateAppointmentType(appointmentTypeId, appointmentTypeSettings) {
    return Api.post(`/appointments/type/${appointmentTypeId}`, {
      appointmentTypeProperties: appointmentTypeSettings
    });
  },

  createAppointmentType(typeOptions) {
    return Api.post("/appointments/type", typeOptions);
  },

  deleteAppointmentType(appointmentTypeId) {
    return Api.post(`/appointments/type/delete/${appointmentTypeId}`);
  }
};
