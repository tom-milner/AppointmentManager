<template>
  <div class="wrapper">
    <!-- Work Day Settings -->
    <h2 class="heading-2">Appointment Types</h2>
    <!-- Current Appointment Types -->
    <div class="container">
      <h3 class="heading-3">Current Appointment Types</h3>
      <p class="paragraph note">
        <span>Note:</span> a 10 minute buffer period is automatically added between appointments.
      </p>
      <ul class="appointment-type-list">
        <li class="list-item" v-for="type in appointmentTypes" :key="type._id">
          <AppointmentTypeContainer
            userCanEdit
            @refresh-appointments="getAppointmentTypes"
            :type="type"
          />
        </li>
        <li class="list-item">
          <button @click="addNewAppointmentType" class="btn btn-secondary">Add New</button>
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import AppointmentTypeService from "@/services/AppointmentTypeService";
import AppointmentTypeContainer from "../../../misc/AppointmentTypeContainer";

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
    addNewAppointmentType() {
      this.appointmentTypes.push({
        name: "",
        description: "",
        duration: 50,
        isRecurring: false
      });
    },

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
      padding: 0.75rem 0;

      button {
        width: 10%;
      }
    }
  }
}
</style>