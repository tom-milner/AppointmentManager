<template>
  <div>
    <h2 class="heading-2">Welcome, {{user.firstname}}</h2>

    <!-- Upcoming Appointments -->
    <div class="container">
      <h3 class="heading-3">Upcoming Approved Appointments</h3>

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
      <h3 class="heading-3">Upcoming Pending Appointments</h3>

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
    <div class="container">
      <h3 class="heading-3">Your Calendar</h3>
      <appointment-calendar :clientAppointments="appointments" class="calendar"></appointment-calendar>
    </div>

    <!-- Modal -->
    <ViewAppointment
      :appointment="selectedAppointment"
      :isUserCounsellor="isUserCounsellor"
      v-if="modalDisplayed"
      v-on:close-modal="modalDisplayed = false"
    ></ViewAppointment>
  </div>
</template>

<script>
import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
import AppointmentService from "@/services/AppointmentService";
import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";
import Role from "@/models/Role";
import ViewAppointment from "@/components/misc/ViewAppointment";

export default {
  components: {
    AppointmentCard,
    ViewAppointment,
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
        ? this.appointmentsFromNow
            .slice(0, 10)
            .filter(appointment => appointment.isApproved)
        : [];
    },
    // returns a list of all the non-approved (pending) appointments
    pendingAppointments() {
      return this.appointmentsFromNow
        ? this.appointmentsFromNow
            .slice(0, 10)
            .filter(appointment => !appointment.isApproved)
        : [];
    }
  },

  methods: {
    getUserAppointments: async function() {
      // get user appointments from API
      // check to see if user is a client or counsellor
      let twoMonthsAgo = this.moment()
        .subtract(2, "month")
        .toString();

      let userIsCounsellor = this.user.role >= Role.Counsellor;
      let response = await AppointmentService.getAppointmentsOfUser({
        userId: this.user._id,
        isCounsellor: userIsCounsellor,
        params: {
          fromTime: twoMonthsAgo,
          limit: 75
        }
      });

      this.appointments = response.data.appointments;
    },
    toggleModal: async function(chosenAppointment) {
      //reload appointments
      console.log(chosenAppointment);
      if (chosenAppointment) {
        this.selectedAppointment = this.appointments.find(appointment => {
          return chosenAppointment._id == appointment._id;
        });
        this.modalDisplayed = true;
      } else {
        this.selectedAppointment = {};
        this.modalDisplayed = false;
      }
      await this.getUserAppointments();
    }
  },
  data() {
    return {
      appointments: [],
      appointmentsFromNow: [],
      user: {},
      modalDisplayed: false,
      selectedAppointment: {}
    };
  },
  mounted: async function() {
    this.user = this.$store.state.authentication.user;
    await this.getUserAppointments();
    // set timer for refreshing data
    //TODO: replace with a socket
    // this.timer = setInterval(this.getUserAppointments, 3000);
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
  padding-left: 1rem;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}
</style>
