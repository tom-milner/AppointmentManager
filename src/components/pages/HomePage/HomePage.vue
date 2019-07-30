<template>
  <div>
    <h2 class="heading-2">Welcome, {{user.username}}</h2>
    <div class="upcoming-appointments-container">
      <h2 class="heading-2">Upcoming Appointments</h2>
      <div class="scrolling-appointments">
        <AppointmentCard
          v-for="appointment in appointments"
          v-bind:key="appointment._id"
          :appointment="appointment"
        ></AppointmentCard>
      </div>
    </div>
  </div>
</template>

<script>
import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
import AppointmentService from "@/services/AppointmentService";
export default {
  components: {
    AppointmentCard
  },

  methods: {
    getUserAppointments: async function() {
      console.log(this.user._id);
      let response = await AppointmentService.getAppointmentsOfUser(
        this.user._id
      );
      this.appointments = response.data.appointments;
    }
  },
  data() {
    return {
      appointments: null,
      user: {}
    };
  },
  mounted: function() {
    this.user = this.$store.state.authentication.user;
    this.getUserAppointments();
  }
};
</script>

<style lang="scss" scoped>
.upcoming-appointments-container {
  margin-top: 5rem;
  overflow: hidden;
}

.scrolling-appointments {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.appointment-card {
  background-color: red;
}
</style>
