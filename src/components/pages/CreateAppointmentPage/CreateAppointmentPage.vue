<template>
  <div>
    <!-- Header -->
    <h1 class="heading-2">Request An Appointment</h1>

    <!-- Form -->
    <div class="request-form">
      <!-- Appointment Title -->
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
        <input v-model="chosenTitle" class="form-input short-input" />
      </div>

      <!-- Counsellor Selection Dropdown -->
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

      <!-- Client selection dropdown - only for counsellors!! -->
      <div class="form-field">
        <h3 class="form-heading">Client</h3>
        <div class="short-input"></div>
      </div>

      <!-- Appointment Date Selection -->
      <div class="form-field">
        <h3 class="form-heading">Appointment Date</h3>
        <input
          :value="getFormattedChosenDate"
          :v-model="getFormattedChosenDate"
          class="form-input short-input"
          disabled
        />
        <div
          v-if="chosenCounsellor._id"
          class="btn btn-secondary short-input"
          @click="toggleAppointmentCalendarModal"
        >Choose from calendar</div>
      </div>

      <!-- Displays the chosen appointment type (if present) -->
      <div v-if="chosenAppointmentType.duration" class="form-field">
        <h3 class="form-heading">Appointment duration</h3>
        <h2 class="heading-3">{{chosenAppointmentType.duration}} minutes</h2>
      </div>

      <!-- Client Notes Input -->
      <div class="form-field">
        <p class="form-heading">Notes:</p>
        <textarea v-model="clientNotes" class="form-input"></textarea>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="form-field">
        <h4 class="heading-4 error">{{this.errorMessage}}</h4>
      </div>

      <!-- Submit form button-->
      <div class="form-field">
        <button @click="requestAppointment" class="btn btn-primary">Request Appointment</button>
      </div>
    </div>

    <!-- Calendar Modal -->
    <Modal v-on:close-modal="toggleAppointmentCalendarModal()" v-if="appointmentCalendarDisplayed">
      <div class="modal-content">
        <AppointmentCalendar
          userCanAddEvents
          v-on:close-modal="toggleAppointmentCalendarModal()"
          v-on:date-chosen="dateChosen"
          :events="{ counsellorEvents: counsellorDates, userEvents:userDates}"
          :businessHours="businessHours"
        />
      </div>
    </Modal>
  </div>
</template>
<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
import Dropdown from "@/components/layout/Dropdown";
import AppointmentCalendar from "../../misc/Calendar/AppointmentCalendar";
import Modal from "@/components/layout/Modal";
import Utils from "@/utils";
import Role from "@/models/Role";

export default {
  components: {
    Dropdown,
    AppointmentCalendar,
    Modal
  },

  computed: {
    userIsCounsellor() {
      return this.user.role >= Role.Counsellor;
    },

    // Formats the date
    getFormattedChosenDate() {
      if (Utils.objIsEmpty(this.chosenStartTime)) return "No date chosen";
      return this.moment(this.chosenStartTime).format("LLL");
    }
  },
  data() {
    return {
      user: {}, // current user object
      userDates: [], // the dates where the user is busy
      counsellorDates: [], // the dates where the counsellor is busy
      businessHours: [], // dates that the counsellor isn't available
      chosenCounsellor: {}, // the counsellor the user has chosen
      counsellors: [], // a list of all the counsellors
      chosenStartTime: {}, // the desired start time of the appointment
      chosenTitle: "", // the desired title of the appointment
      chosenAppointmentType: {}, // the desired type of the appointment
      clientNotes: "", // any notes the client (current user) has about the appointment.
      appointmentCalendarDisplayed: false,
      errorMessage: "" // if there is an error message it is stored here.
    };
  },
  methods: {
    // validate any input from the user. This process is also repeated on the server.
    // returns an object containing error and message.
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
      if (!this.chosenAppointmentType.duration) {
        return {
          error: true,
          message:
            "Please choose a valid appointment type for your appointment."
        };
      }
      // data is all good!!!!
      return {
        error: false
      };
    },

    // This function uses the AppointmentService to request a new appointment.
    requestAppointment: async function() {
      try {
        // validate input
        let { error, message } = this.validateInput();
        // only send request if there's no input validation error
        if (error) {
          throw message;
        }

        // build request body
        let appointment = {
          startTime: this.chosenStartTime,
          title: this.chosenTitle,
          typeId: this.chosenAppointmentType._id,
          counsellorId: this.chosenCounsellor._id,
          clientNotes: this.clientNotes
        };

        console.log(appointment);

        // send request
        let result = await AppointmentService.requestAppointment(appointment);
        console.log(result.data);
        // check for server error
        if (!result.data.success || result.data.status == 400) {
          throw result.data.message;
        }

        // request was a success (appointment has been made) - redirect user
        this.$router.push("/home");
      } catch (errorMessage) {
        console.log(errorMessage);
        this.errorMessage = errorMessage;
      }
    },

    // when a date has been chosen from the calendar, set the local state.
    dateChosen({ appointmentStartTime, appointmentType }) {
      this.chosenStartTime = appointmentStartTime;

      this.chosenAppointmentType = appointmentType;
    },

    // update the local state of the counsellor.
    updateCounsellor: function(counsellor) {
      this.chosenCounsellor = counsellor;
    },

    // gets all the appointments that involve the clients
    getAppointmentsOfClient: async function() {
      // get appointments of current user
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.user._id,
        isCounsellor: false
      })).data.appointments;
      return result;
    },

    // get all the appointments that involve the counsellor.
    getAppointmentsOfCounsellor: async function() {
      // get appointments
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.chosenCounsellor._id,
        isCounsellor: true,
        reduced: true
      })).data.appointments;
      return result;
    },

    // This function turns an array of appointments into an array of simple object, consisting of {start, end, title}
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
    },

    createBusinessHours() {
      this.businessHours = this.chosenCounsellor.workingDays.map(day => {
        // return start, end and title

        let dayNumber = Utils.getNumberOfDayInWeek(day.name);
        return {
          startTime: day.startTime,
          endTime: day.endTime,
          daysOfWeek: [dayNumber]
        };
      });
    }
  },

  watch: {
    // watch chosenCounsellor and get their appointments whenever one is chosen
    chosenCounsellor: async function() {
      // Make sure we only perform requests if the user has chosen a counsellor.
      if (!this.chosenCounsellor._id) return;

      //TODO: currently updating calendar to support disabled dates. check todo.md
      // update disabledDates with the dates the counsellor can't make
      this.createBusinessHours();

      // get counsellor appointments.
      let counsellorAppointments = await this.getAppointmentsOfCounsellor();
      this.counsellorDates = this.mapAppointmentsToDates(
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
    let userAppointments = await this.getAppointmentsOfClient();

    // save the user dates.
    this.userDates = this.mapAppointmentsToDates(userAppointments);
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
