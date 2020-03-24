rR
<template>
  <div>
    <div class="wrapper">
      <h2 class="heading-2">Welcome, {{ user.firstname }}</h2>

      <!-- The day's appointments -->
      <div class="stats">
        <div class="day" v-for="(day, index) in getDayCards" :key="day">
          <h3 class="heading-3">{{ day }}</h3>
          <h4 class="heading-4">
            Total:
            <span>{{ getNoAppointmentsOnDay(appointmentsFromNow, index) }}</span>
          </h4>
          <br/>
          <h4 class="heading-4">
            Approved:
            <span>{{ getNoAppointmentsOnDay(approvedAppointments, index) }}</span>
          </h4>
          <br/>
          <h4 class="heading-4">
            Pending:
            <span>{{ getNoAppointmentsOnDay(pendingAppointments, index) }}</span>
          </h4>
        </div>
      </div>

      <div class="container options">
        <div class="search">
          <icon class="icon" name="search"></icon>
          <h3 class="heading-3">Search:</h3>
          <input type="text" v-model="searchQuery" class="form-input search-box"/>
        </div>
        <div class="filter">
          <icon name="filter"></icon>
          <h3 class="heading-3">Filter:</h3>
          <select v-model="chosenTimePeriod" class="form-input select">
            <option v-for="timePeriod in timePeriods" :key="timePeriod" :value="timePeriod">
              {{ timePeriod }}
            </option>
          </select>
        </div>
      </div>

      <h4 class="heading-4 error message" :class="{ success: message.success }">{{ message.content }}</h4>

      <!-- Upcoming Appointments -->
      <div class="container">
        <h3 class="heading-3">Upcoming Approved Appointments</h3>

        <div
            v-if="
            searchAppointments(approvedAppointments) != undefined && searchAppointments(approvedAppointments).length > 0
          "
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
            v-if="
            searchAppointments(pendingAppointments) != undefined && searchAppointments(pendingAppointments).length > 0
          "
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
        <appointment-calendar
            v-on:update-events="getUserAppointments"
            :clientAppointments="appointments"
            class="calendar"
        ></appointment-calendar>
      </div>

      <!-- Modal -->
      <ViewAppointment
          :appointment="selectedAppointment"
          :isCounsellor="isUserCounsellor"
          v-if="modalDisplayed"
          v-on:close-modal="
          modalDisplayed = false;
          getUserAppointments();
        "
      ></ViewAppointment>
    </div>
  </div>
</template>

<script>
  import AppointmentCard from "@/components/pages/HomePage/AppointmentCard.vue";
  import AppointmentService from "@/services/AppointmentService";
  import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";
  import Roles from "@/models/Roles";
  import ViewAppointment from "@/components/misc/ViewAppointment/ViewAppointment";

  export default {
    components: {
      AppointmentCard,
      ViewAppointment,
      AppointmentCalendar
    },

    watch: {
      // When the user changes the time period of the displayed appointments, fetch the user's appointments.
      chosenTimePeriod() {
        this.getUserAppointments();
      }
    },

    computed: {
      // Returns the future appointments.
      appointmentsFromNow() {
        let now = this.moment();
        return this.appointments.filter(appointment => this.moment(appointment.startTime) >= now);
      },

      // Whether the user is a counsellor or not.
      isUserCounsellor() {
        return this.user.role >= Roles.COUNSELLOR;
      },

      // Returns a list of all the approved appointments
      approvedAppointments() {
        return this.appointmentsFromNow ? this.appointmentsFromNow.filter(appointment => appointment.isApproved) : [];
      },
      // Returns a list of all the non-approved (pending) appointments
      pendingAppointments() {
        return this.appointmentsFromNow ? this.appointmentsFromNow.filter(appointment => !appointment.isApproved) : [];
      },

      // Calculate the day card information (displayed on the right of the window).
      getDayCards() {
        let dayCards = [];
        // Display a different number of cards depending on the active time period (bigger time period -> more cards)
        const noCards =
            this.timePeriods.indexOf(this.chosenTimePeriod) + 1 >= 3
                ? 3
                : this.timePeriods.indexOf(this.chosenTimePeriod) + 1;

        // Add each day to the dayCards list containing just the day name.
        for (let i = 0; i < noCards; i++) {
          dayCards.push(
              // Get the name of the day from the time date time string supplied by moment.
              this.moment()
                  .add(i, "day")
                  .calendar()
                  .split(" ")[0]
          );
        }
        return dayCards;
      }
    },

    methods: {
      // Set the error/sucess message.
      setMessage(message, success) {
        this.message.content = message;
        this.message.success = success;
      },

      // Get the number of appointments on a given day.
      // daysFromNow: the number of days ahead the day is.
      getNoAppointmentsOnDay(appointments, daysFromNow) {
        const now = this.moment();
        const endOfDay = now
            .clone()
            .startOf("day")
            .add(1, "day");

        // If daysFromNow is supplied, the function will work out the number of appointments on the day 'daysFromNow' days from now.
        if (daysFromNow) {
          now.add(daysFromNow, "day").startOf("day");
          endOfDay.add(daysFromNow, "day");
        }
        //   Filter the supplied appointments.
        return appointments.filter(appointment => this.moment(appointment.startTime).isBetween(now, endOfDay)).length;
      },

      // Search the supplied appointments.
      searchAppointments(appointments) {
        if (!this.searchQuery) return appointments; // If the search bar is blank, don's filter the appointments.

        // Filter the appointment's title and appointment type.
        return appointments.filter(appointment => {
          const searchQuery = this.searchQuery.toLowerCase();
          return (
              appointment.title.toLowerCase().includes(searchQuery) ||
              appointment.appointmentType.name.toLowerCase().includes(searchQuery)
          );
        });
      },

      // Get the user's appointments.
      getUserAppointments: async function () {
        // Check to see if user is a client or counsellor
        let twoMonthsAgo = this.moment()
            .subtract(2, "month")
            .toString();

        // Determine the limit time for appointments using the chosen time period.
        let limitTime =
            this.chosenTimePeriod === "All" ? undefined // If the time period is 'all', don't limit the appointments.
                : this.moment()
                    .endOf(this.chosenTimePeriod)
                    .toString(); // Limit the appointments to the end of the time period.

        try {
          // Get the user's appointments.
          let response = await AppointmentService.getAppointmentsOfUser({
            userId: this.user._id,
            isCounsellor:  this.user.role >= Roles.COUNSELLOR,
            params: {
              fromTime: twoMonthsAgo,
              limitTime: limitTime
            }
          });

          this.appointments = response.data.appointments;
        } catch (error) {
          this.setMessage(error.response ? error.response.data.message : "Error getting appointments.", false);
        }
      },

      // Toggle the view appointment modal.
      toggleModal: async function (chosenAppointment) {
        // If an appointment is supplied, show the modal containing the appointment.
        if (chosenAppointment) {
          this.selectedAppointment = chosenAppointment;
          this.modalDisplayed = true;
        } else {
          this.selectedAppointment = {};
          this.modalDisplayed = false;
        }

        // Refresh the appointments.
        await this.getUserAppointments();
      }
    },
    data() {
      return {
        appointments: [], // The user's appointments.
        user: {}, // The current user.
        modalDisplayed: false, // Whether the modal is displayed or not.
        selectedAppointment: {}, // The appointment selected by the user.
        searchQuery: "", // The query to search the appointments with.
        timePeriods: ["Day", "Week", "Month", "Year", "All"], // The available time periods avaialable to filter the appointments with.
        chosenTimePeriod: "Year", // The selected time period.
        message: {
          // The success/error message.
          content: "",
          success: false
        }
      };
    },
    mounted: async function () {
      // Get the user info from the store.
      this.user = this.$store.state.authentication.user;
      await this.getUserAppointments(); // Get the user's appointments.

      // Refresh user appointments every minute.
      this.timer = setInterval(this.getUserAppointments, 60000);
    },
    destroyed() {
      // Stop the timer when the page is destroyed.
      clearInterval(this.timer);
    }
  };
</script>

<style lang="scss" scoped>
  @import "src/scss/global";

  .wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .stats {
    position: absolute;
    max-width: 50%;
    right: 1rem;
    top: 1rem;

    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;

    .day {
      margin-left: 2rem;
      margin-bottom: 2rem;
      min-width: 20rem;
      display: inline-block;
      border: 1px solid $color-inactive;
      padding: 1.5rem;
      border-radius: 10px;

      h3 {
        margin-bottom: 1rem;
        font-weight: 300;
        color: $color-primary;
      }

      h4 {
        &:not(:last-child) {
          margin-bottom: 0.2rem;
        }

        display: inline;

        span {
          float: right;
        }
      }
    }
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

    &.options {
      width: 60rem;

      & .form-input {
        vertical-align: middle;
      }

      h3 {
        width: 10rem;
        display: inline-block;
        vertical-align: middle;
      }

      .icon {
        width: 2rem;
        height: 2rem;
        display: inline-block;
        vertical-align: middle;
        color: $color-primary;
        margin-right: 1rem;
      }

      .filter {
        select {
          width: 25rem;
        }
      }

      .search {
        margin-bottom: 0.5rem;

        .search-box {
          display: inline-block;
          width: 25rem;
          vertical-align: middle;
        }
      }
    }
  }

  .scrolling-appointments {
    padding-left: 1rem;
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    min-height: 18rem;
    margin-top: 1rem;
  }

  .message {
    margin-top: 4rem;
    margin-left: 2rem;
  }
</style>
