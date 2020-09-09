// Service for interacting with appointment types.

import Api from "@/services/Api";

export default {
  getAppointmentTypes() {
    return Api.get("/appointments/type");
  },

  updateAppointmentType(appointmentTypeId, appointmentTypeSettings) {
    return Api.post(`/appointments/type/${appointmentTypeId}`, {
      appointmentTypeProperties: appointmentTypeSettings
    });
  },

  createAppointmentType(appointmentTypeInfo) {
    return Api.post("/appointments/type", appointmentTypeInfo);
  },

  deleteAppointmentType(appointmentTypeId) {
    return Api.post(`/appointments/type/delete/${appointmentTypeId}`);
  }
};
