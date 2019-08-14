<template>
  <div>
    <h1 class="heading-2">Request An Appointment</h1>
    <div class="request-form">
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
        <input class="form-input short-input" />
      </div>

      <div class="form-field">
        <h3 class="form-heading">Counsellor</h3>
        <div class="short-input">
          <dropdown
            v-if="counsellors.length > 0"
            :options="counsellors"
            :selected="chosenCounsellor"
            :dropdownKey="'username'"
            v-on:updateOption="updateCounsellor"
            :placeholder="'Choose a counsellor'"
          ></dropdown>
        </div>
      </div>

      <div class="form-field">
        <h3 class="form-heading">Appointment Date</h3>
        <div class="calendar-box">
          <FullCalendar
            class="calendar"
            ref="fullCalendar"
            :weekends="false"
            defaultView="dayGridMonth"
            :header="{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }"
            :plugins="calendarPlugins"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
import Dropdown from "@/components/layout/Dropdown";

// calendar
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    Dropdown,
    FullCalendar
  },
  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      user: {},
      disabledDates: [],
      userAppointments: [],
      counsellorAppointments: [],
      chosenCounsellor: {},
      counsellors: []
    };
  },
  methods: {
    updateCounsellor: function(counsellor) {
      this.chosenCounsellor = counsellor;
    },

    // gets all the appointments in the future that involve the clients
    getUnavailableTimeSlotsOfClient: async function() {
      // get future appointments of current user
      this.userAppointments = (await AppointmentService.getAppointmentsOfClient(
        this.user._id
      )).data.appointments;

      // Add user dates to disabled dates, removing duplicates.
      // this.disabledDates = this.disabledDates.concat(this.userDates);
    },

    getUnavailableTimeSlotsOfCounsellor: async function() {
      // get future apointments
      this.counsellorAppointments = await AppointmentService.getFutureAppointmentsOfCounsellor(
        this.chosenCounsellor._id
      ).data.futureAppointments;
    },

    mapAppointmentsToDates(appointments) {
      // turn appointments into date ranges
      return appointments.map(appointment => {
        let startTime = appointment.startTime;
        let endTime = appointment.endTime;
        return {
          start: startTime,
          end: endTime
        };
      });
    }
  },

  watch: {
    // watch chosenCounsellor and find unavailable times whenever one is chosen
    chosenCounsellor: async function(counsellor) {
      let result = await AppointmentService.getFutureAppointmentsOfCounsellor(
        counsellor._id
      );
      this.counsellorAppointments = result.data.futureAppointments;

      let allAppointments = this.counsellorAppointments.concat(
        this.userAppointments
      );
      this.disabledDates = this.mapAppointmentsToDates(allAppointments);
    }
  },

  async mounted() {
    // get all counsellors
    this.counsellors = (await UserService.getAllCounsellors()).data.counsellors;
    console.log(this.counsellors);

    // store user in local variable
    this.user = this.$store.state.authentication.user;

    // get times when client is unavailable
    await this.getUnavailableTimeSlotsOfClient();

    // disable the dates on the calendar
    this.disabledDates = this.mapAppointmentsToDates(this.userAppointments);
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
// calendar css
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";

.request-form {
  margin: 2rem 0;

  .form-field {
    max-width: 75%;
    width: auto;
    &:not(:last-of-type) {
      margin-bottom: 2rem;
    }

    .short-input {
      width: 30%;
    }
  }
  .calendar-box {
    width: 100%;
    margin-top: 1.2rem;
    .calendar {
      margin: 0 auto;
    }
  }
}
</style>
