<template>
  <div>
    <div class="wrapper">
      <h2 class="heading-2">Welcome, {{user.firstname}}</h2>

      <!-- Sort bar -->
      <div class="container search">
        <h3 class="heading-3">Search Appointments:</h3>
        <input type="text" v-model="searchQuery" class="form-input search-box" />
      </div>

      <!-- The day's appointments -->
      <div class="stats">
        <h3 class="heading-3">Today's Appointments</h3>
        <h4 class="heading-4">Approved: {{getTodaysRemainingAppointments(approvedAppointments)}}</h4>
        <h4 class="heading-4">Pending: {{getTodaysRemainingAppointments(pendingAppointments)}}</h4>
      </div>

      <!-- Upcoming Appointments -->
      <div class="container">
        <h3 class="heading-3">Upcoming Approved Appointments</h3>

        <div
          v-if=" searchAppointments(approvedAppointments)!=undefined && searchAppointments(approvedAppointments).length > 0"
          class="scrolling-appointments"
        >
          <AppointmentCard
            v-for="appointment in searchAppointments(approvedAppointments)"
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
          v-if=" searchAppointments(pendingAppointments)!=undefined && searchAppointments(pendingAppointments).length > 0"
          class="scrolling-appointments"
        >
          <AppointmentCard
            v-for="appointment in searchAppointments(pendingAppointments)"
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
    getTodaysRemainingAppointments(appointments) {
      const now = this.moment();
      const endOfDay = now
        .clone()
        .startOf("day")
        .add(1, "day");
      console.log(endOfDay.format(" Do HH:mm"));
      return appointments.filter(appointment =>
        this.moment(appointment.startTime).isBetween(now, endOfDay)
      ).length;
    },

    searchAppointments(appointments) {
      return appointments.filter(appointment => {
        if (!this.searchQuery) return true;
        const searchQuery = this.searchQuery.toLowerCase();
        return (
          appointment.title.toLowerCase().includes(searchQuery) ||
          appointment.appointmentType.name.toLowerCase().includes(searchQuery)
        );
      });
    },

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
      selectedAppointment: {},
      searchQuery: ""
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
.wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}
.stats {
  position: absolute;
  top: 3rem;
  right: 3rem;
}
.container {
  margin-top: 5rem;
  overflow: hidden;
  width: 100%;
  position: relative;

  .no-appointments-box {
    height: 18rem;

    h4 {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, 50%);
      display: block;
    }
  }

  &.search {
    // width: 30rem;
    h3 {
      display: inline;
      vertical-align: middle;
    }

    .search-box {
      display: inline-block;
      width: 30rem;
      margin-left: 1rem;
      vertical-align: middle;
    }
  }
}

.scrolling-appointments {
  padding-left: 1rem;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  min-height: 18rem;
}
</style>
