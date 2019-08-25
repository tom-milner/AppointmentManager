<template>
  <div>
    <h1 class="heading-2">Request An Appointment</h1>
    <div class="request-form">
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
        <input v-model="chosenTitle" class="form-input short-input" />
      </div>

      <div class="form-field">
        <h3 class="form-heading">Counsellor</h3>
        <div class="short-input">
          <dropdown
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
          class="btn btn-secondary short-input"
          @click="toggleAppointmentCalendarModal"
        >Choose from calendar</div>
      </div>

      <div v-if="chosenDuration" class="form-field">
        <h3 class="form-heading">Appointment duration</h3>
        <h2 class="heading-3">{{chosenDuration}} minutes</h2>
      </div>

      <div class="form-field">
        <p class="form-heading">Notes:</p>
        <textarea v-model="notes" class="form-input"></textarea>
      </div>
      <div v-if="errorMessage.length > 0" class="form-field">
        <h4 class="heading-4 error">{{this.errorMessage}}</h4>
      </div>

      <!-- Submit form -->
      <div class="form-field">
        <button @click="requestAppointment" class="btn btn-primary">Request Appointment</button>
      </div>
    </div>

    <!-- Modal -->
    <Modal v-on:close-modal="toggleAppointmentCalendarModal()" v-if="appointmentCalendarDisplayed">
      <div class="modal-content">
        <AppointmentCalendar
          isEditable
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
import AppointmentCalendar from "../../misc/AppointmentCalendar";
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
      if (Utils.objIsEmpty(this.chosenStartTime)) return "No date chosen";
      return this.moment(this.chosenStartTime).format("LLL");
    }
  },
  data() {
    return {
      user: {},
      userDisabledDates: [],
      counsellorDisabledDates: [],
      chosenCounsellor: {},
      counsellors: [],
      chosenStartTime: {},
      chosenTitle: "",
      chosenDuration: 0,
      notes: "",
      appointmentCalendarDisplayed: false,
      errorMessage: ""
    };
  },
  methods: {
    validateInput() {
      // check for title
      if (!this.chosenTitle) {
        return {
          error: true,
          message: "Please enter a title for your appointment."
        };
      }
      // check if user has chosen a counsellor
      if (!this.chosenCounsellor._id) {
        return {
          error: true,
          message: "Please choose a counsellor for your appointment."
        };
      }
      // check to see if user has chosen a start time
      if (!this.chosenStartTime._isAMomentObject) {
        return {
          error: true,
          message: "Please choose a time and date for your appointment."
        };
      }

      // TODO: create file for error message constants

      // check to see if user has chosen a duration
      if (this.chosenDuration == 0) {
        return {
          error: true,
          message: "Please choose a valid duration for your appointment."
        };
      }

      // data is all good!!!!
      return {
        error: false
      };
    },

    requestAppointment: async function() {
      try {
        // validate input
        let { error, message } = this.validateInput();
        // only send request if there's no inut validation error
        if (error) {
          throw message;
        }
        // build request body
        let appointment = {
          startTime: this.chosenStartTime,
          title: this.chosenTitle,
          duration: this.chosenDuration,
          counsellorId: this.chosenCounsellor._id,
          clientNotes: this.notes
        };
        // send request
        let result = await AppointmentService.requestAppointment(appointment);

        // check for server error
        if (!result.data.success || result.data.status == 400) {
          throw result.data.message;
        }

        // request was a success - redirect user
        this.$router.push("/");
      } catch (errorMessage) {
        console.log(errorMessage);
        this.errorMessage = errorMessage;
      }
    },

    dateChosen({ appointmentStartTime, appointmentDuration }) {
      this.chosenStartTime = appointmentStartTime;
      this.chosenDuration = appointmentDuration;
    },

    updateCounsellor: function(counsellor) {
      this.chosenCounsellor = counsellor;
    },

    // TODO: refactor function

    // gets all the appointments that involve the clients
    getUnavailableTimeSlotsOfClient: async function() {
      // get appointments of current user
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.user._id,
        isCounsellor: false
      })).data.appointments;
      return result;
    },
    getUnavailableTimeSlotsOfCounsellor: async function() {
      // get apointments
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.chosenCounsellor._id,
        isCounsellor: true,
        reduced: true
      })).data.appointments;
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
  width: 40%;

  .form-field {
    width: auto;
    &:not(:last-of-type) {
      margin-bottom: 2rem;
    }

    .short-input {
      width: 60%;
    }

    textarea {
      resize: none;
      height: 20rem;
      width: 100%;
    }

    button {
      width: 100%;
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
