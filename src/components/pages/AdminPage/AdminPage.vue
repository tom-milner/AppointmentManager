<template>
  <div class="container"></div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";

export default {
  data() {
    return {
      appointments: []
    };
  },
  async beforeCreate() {
    this.appointments = (await AppointmentService.getAllAppointments()).data;
    console.log(this.appointments);
  }
};
</script>

<style>
</style>
