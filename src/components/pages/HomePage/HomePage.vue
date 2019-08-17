<template>
  <div>
    <h2 class="heading-2">Welcome, {{user.firstname}}</h2>
    <div class="appointments-container">
      <h2 class="heading-2">Upcoming Appointments</h2>

      <div
        v-if=" appointments!=undefined && appointments.length > 0"
        class="scrolling-appointments"
      >
        <AppointmentCard
          v-for="appointment in appointments"
          v-bind:key="appointment._id"
          :appointment="appointment"
          @click.native="toggleModal(appointment)"
        ></AppointmentCard>
      </div>
      <div class="no-appointments-box" v-else>
        <h4 class="heading-4 error">No Upcoming Appointments!</h4>
      </div>
    </div>
    <div class="appointments-container">
      <h2 class="heading-2">Pending Appointments</h2>
      <div class="scrolling-appointments"></div>
      <div class="no-appointments-box">
        <h4 class="heading-4 error">No Pending Appointments!</h4>
      </div>
    </div>
    <Modal v-on:close-modal="toggleModal()" v-if="modalDisplayed">
      <div class="modal-content">
        <AppointmentFull :appointment="selectedAppointment"></AppointmentFull>
      </div>
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
      // get user appointments from API
      console.log(this.user._id);
      let response = await AppointmentService.getAppointmentsOfClient(
        this.user._id
      );
      // sort user appointments and set local state
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

  .no-appointments-box {
    padding: 4rem 0 0 4rem;
  }
}

.scrolling-appointments {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.modal-content {
  width: 50rem;
}
</style>
