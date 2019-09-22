<template>
  <div class="wrapper">
    <!-- Work Day Settings -->
    <h2 class="heading-2">Appointment Settings</h2>
    <!-- Current Appointment Types -->
    <div class="container">
      <h3 class="heading-3">Appointment Types</h3>
      <ul class="appointment-type-list">
        <li class="list-item" v-for="type in appointmentTypes" :key="type._id">
          <AppointmentTypeContainer :appointmentType="type" />
        </li>
        <li class="list-item">
          <button class="btn btn-secondary">Add New</button>
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import AppointmentTypeService from "@/services/AppointmentTypeService";
import AppointmentTypeContainer from "./AppointmentTypeContainer";

export default {
  components: {
    AppointmentTypeContainer
  },
  data() {
    return {
      appointmentTypes: []
    };
  },
  methods: {
    async getAppointmentTypes() {
      let result = await AppointmentTypeService.getAppointmentTypes();
      if (result.data.success) {
        this.appointmentTypes = result.data.appointmentTypes;
      }
    }
  },
  mounted() {
    this.getAppointmentTypes();
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global.scss";

.container {
  margin-top: 5rem;
  .appointment-type-list {
    list-style: none;
    margin-top: 1rem;
    .list-item {
      padding: 1rem;

      button {
        width: 10%;
      }
    }
  }
}
</style>