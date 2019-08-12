<template>
  <div>
    <h2 class="heading-2">Welcome, {{user.username}}</h2>
    <div class="appointments-container">
      <h2 class="heading-2">Upcoming Appointments</h2>
      <div class="scrolling-appointments">
        <AppointmentCard
          v-for="appointment in appointments"
          v-bind:key="appointment._id"
          :appointment="appointment"
          @click.native="toggleModal(appointment)"
        ></AppointmentCard>
      </div>
    </div>
    <div class="appointments-container">
      <h2 class="heading-2">Pending Appointments</h2>
      <div class="scrolling-appointments"></div>
    </div>
    <Modal v-on:close-modal="toggleModal()" v-if="modalDisplayed">
      <AppointmentFull :appointment="selectedAppointment"></AppointmentFull>
    </Modal>
  </div>
</template>

<script>
import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
import AppointmentFull from "@/components/pages/HomePage/AppointmentFull.vue";
import Modal from "@/components/layout/Modal";
import AppointmentService from "@/services/AppointmentService";
export default {
  components: {
    AppointmentCard,
    Modal,
    AppointmentFull
  },

  methods: {
    getUserAppointments: async function() {
      console.log(this.user._id);
      let response = await AppointmentService.getAppointmentsOfUser(
        this.user._id
      );
      this.appointments = response.data.appointments;
    },
    toggleModal: function(appointment) {
      this.selectedAppointment = appointment;
      this.modalDisplayed = !this.modalDisplayed;
    }
  },
  data() {
    return {
      appointments: null,
      user: {},
      modalDisplayed: false,
      selectedAppointment: {}
    };
  },
  mounted: function() {
    this.user = this.$store.state.authentication.user;
    this.getUserAppointments();
  }
};
</script>

<style lang="scss" scoped>
.appointments-container {
  margin-top: 5rem;
  overflow: hidden;
}

.scrolling-appointments {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
