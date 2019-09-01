<template>
  <div>
    <h2 class="heading-2">Welcome, {{user.firstname}}</h2>

    <!-- Upcoming Appointments -->
    <div class="container">
      <h2 class="heading-2">Upcoming Approved Appointments</h2>

      <div
        v-if=" approvedAppointments!=undefined && approvedAppointments.length > 0"
        class="scrolling-appointments"
      >
        <AppointmentCard
          v-for="appointment in approvedAppointments"
          v-bind:key="appointment.startTime"
          :appointment="appointment"
          @click.native="toggleModal(appointment)"
        ></AppointmentCard>
      </div>
      <div class="no-appointments-box" v-else>
        <h4 class="heading-4 error">No Upcoming Appointments!</h4>
      </div>
    </div>

    <!-- Pending Appointments -->
    <div class="container">
      <h2 class="heading-2">Upcoming Pending Appointments</h2>

      <div
        v-if=" pendingAppointments!=undefined && pendingAppointments.length > 0"
        class="scrolling-appointments"
      >
        <AppointmentCard
          v-for="appointment in pendingAppointments"
          v-bind:key="appointment.startTime"
          :appointment="appointment"
          @click.native="toggleModal(appointment)"
        ></AppointmentCard>
      </div>
      <div class="no-appointments-box" v-else>
        <h4 class="heading-4 error">No Pending Appointments!</h4>
      </div>
    </div>

    <!-- Calendar -->
    <div class="container calendar">
      <h2 class="heading-2">Your Calendar</h2>
      <!-- TODO: add click to view appointment -->
      <appointment-calendar :events="events"></appointment-calendar>
    </div>

    <!-- Modal -->
    <Modal v-on:close-modal="toggleModal()" v-if="modalDisplayed">
      <div class="modal-content">
        <AppointmentFull :isCounsellor="isUserCounsellor" :appointment="selectedAppointment"></AppointmentFull>
      </div>
    </Modal>
  </div>
</template>

<script>
import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
import AppointmentFull from "@/components/pages/HomePage/AppointmentFull.vue";
import Modal from "@/components/layout/Modal";
import AppointmentService from "@/services/AppointmentService";
import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";
import Role from "@/models/Role";

export default {
  components: {
    AppointmentCard,
    Modal,
    AppointmentFull,
    AppointmentCalendar
  },

  watch: {
    appointments: function() {
      let now = this.moment();
      this.appointmentsFromNow = this.appointments.filter(
        appointment => this.moment(appointment.startTime) >= now
      );
    }
  },

  computed: {
    isUserCounsellor() {
      return this.user.role >= Role.Counsellor;
    },
    // returns a list of all the approved appointments
    approvedAppointments() {
      return this.appointmentsFromNow
        ? this.appointmentsFromNow.filter(appointment => appointment.isApproved)
        : [];
    },
    // returns a list of all the non-approved (pending) appointments
    pendingAppointments() {
      return this.appointmentsFromNow
        ? this.appointmentsFromNow.filter(
            appointment => !appointment.isApproved
          )
        : [];
    }
  },

  methods: {
    getUserAppointments: async function() {
      // get user appointments from API
      // check to see if user is a client or counsellor
      let userIsCounsellor = this.user.role >= Role.Counsellor;
      let response = await AppointmentService.getAppointmentsOfUser({
        userId: this.user._id,
        isCounsellor: userIsCounsellor
      });

      this.appointments = response.data.appointments;
    },
    toggleModal: function(appointment) {
      //reload appointments
      this.getUserAppointments();
      this.selectedAppointment = appointment;
      this.modalDisplayed = !this.modalDisplayed;
    }
  },
  data() {
    return {
      appointments: [],
      appointmentsFromNow: [],
      user: {},
      modalDisplayed: false,
      selectedAppointment: {},
      events: { userEvents: {} }
    };
  },
  mounted: async function() {
    this.user = this.$store.state.authentication.user;
    await this.getUserAppointments();

    // set timer for refreshing data
    //TODO: replace with a socket
    // this.timer = setInterval(this.getUserAppointments, 3000);

    // TODO: remove duplication duplication
    this.events.userEvents = this.appointments.map(appointment => ({
      title: appointment.title,
      end: appointment.endTime,
      start: appointment.startTime
    }));
  }
};
</script>

<style lang="scss" scoped>
.container {
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
  width: 80rem;
}
</style>
