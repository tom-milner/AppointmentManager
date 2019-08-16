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
        <input
          :value="getFormattedChosenDate"
          :v-model="getFormattedChosenDate"
          class="form-input short-input"
          disabled
        />
        <div
          class="primary-btn short-input"
          @click="toggleAppointmentCalendarModal"
        >Choose from calendar</div>
      </div>
    </div>
    <Modal v-on:close-modal="toggleAppointmentCalendarModal()" v-if="appointmentCalendarDisplayed">
      <div class="modal-content">
        <AppointmentCalendar
          v-on:close-modal="toggleAppointmentCalendarModal()"
          v-on:date-chosen="dateChosen"
          :events="{ counsellorEvents: counsellorDisabledDates, userEvents:userDisabledDates}"
        />
      </div>
    </Modal>
  </div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
import Dropdown from "@/components/layout/Dropdown";
import AppointmentCalendar from "./AppointmentCalendar/AppointmentCalendar";
import Modal from "@/components/layout/Modal";
import Utils from "@/utils";

export default {
  components: {
    Dropdown,
    AppointmentCalendar,
    Modal
  },

  computed: {
    getFormattedChosenDate() {
      if (Utils.objIsEmpty(this.chosenTime.startTime)) return "No date chosen";
      return this.moment(this.chosenTime.startTime).format("LLL");
    }
  },
  data() {
    return {
      user: {},
      userDisabledDates: [],
      counsellorDisabledDates: [],
      chosenCounsellor: {},
      counsellors: [],
      chosenTime: {
        startTime: {},
        duration: Number
      },
      appointmentCalendarDisplayed: false
    };
  },
  methods: {
    dateChosen({ appointmentStartTime, appointmentDuration }) {
      this.chosenTime.startTime = appointmentStartTime;
      this.chosenTime.duration = appointmentDuration;
    },

    updateCounsellor: function(counsellor) {
      this.chosenCounsellor = counsellor;
    },

    // gets all the appointments in the future that involve the clients
    getUnavailableTimeSlotsOfClient: async function() {
      // get future appointments of current user
      let result = (await AppointmentService.getAppointmentsOfClient(
        this.user._id
      )).data.appointments;
      return result;
    },
    getUnavailableTimeSlotsOfCounsellor: async function() {
      // get future apointments
      let result = (await AppointmentService.getFutureAppointmentsOfCounsellor(
        this.chosenCounsellor._id
      )).data.futureAppointments;
      return result;
    },

    mapAppointmentsToDates(appointments) {
      // turn appointments into date ranges
      return appointments.map(appointment => ({
        title: appointment.title,
        start: appointment.startTime,
        end: appointment.endTime
      }));
    },

    // open and close appointment calendar
    toggleAppointmentCalendarModal() {
      this.appointmentCalendarDisplayed = !this.appointmentCalendarDisplayed;
    }
  },

  watch: {
    // watch chosenCounsellor and find unavailable times whenever one is chosen
    chosenCounsellor: async function() {
      let counsellorAppointments = await this.getUnavailableTimeSlotsOfCounsellor();
      this.counsellorDisabledDates = this.mapAppointmentsToDates(
        counsellorAppointments
      );
    }
  },

  async mounted() {
    // get all counsellors
    this.counsellors = (await UserService.getAllCounsellors()).data.counsellors;

    // store user in local variable
    this.user = this.$store.state.authentication.user;

    // get times when client is unavailable
    let userAppointments = await this.getUnavailableTimeSlotsOfClient();

    // disable the dates on the calendar
    this.userDisabledDates = this.mapAppointmentsToDates(userAppointments);
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

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
  }
}

.modal-content {
  width: 110rem;
}
</style>
