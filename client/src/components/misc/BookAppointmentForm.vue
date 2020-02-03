<template>
  <div>
    <!-- Form -->
    <div class="request-form">
      <!-- Appointment Title -->
      <div class="form-field">
        <h4 class="form-heading">Appointment Title</h4>
        <input type="text" max="200" v-model="chosenTitle" class="form-input short-input" />
        <p class="paragraph">
          <em>This will default to the name of the appointment type if left blank.</em>
        </p>
      </div>

      <!-- Counsellor Selection Dropdown -->
      <div class="form-field">
        <h4 class="form-heading">Counsellor</h4>
        <select
          v-if="!specificCounsellor"
          :disabled="this.specificCounsellor"
          class="form-input short-input select"
          v-model="chosenCounsellor"
        >
          <option v-for="counsellor in counsellors" :key="counsellor._id" :value="counsellor"
            >{{ counsellor.firstname }} {{ counsellor.lastname }}</option
          >
        </select>
        <h4 v-else class="heading-4">{{ chosenCounsellor.firstname }} {{ chosenCounsellor.lastname }}</h4>
      </div>

      <!-- Client selection dropdown - only for counsellors!! -->
      <div class="form-field" v-if="userIsCounsellor">
        <h4 class="form-heading">Client</h4>
        <select class="form-input short-input select" v-model="chosenClient">
          <option v-for="client in clients" :key="client._id" :value="client"
            >{{ client.firstname }} {{ client.lastname }}</option
          >
        </select>
      </div>

      <!-- Appointment Date Selection -->
      <div class="form-field">
        <h4 class="form-heading">Appointment Date</h4>
        <input
          :value="getFormattedChosenDate"
          :v-model="getFormattedChosenDate"
          class="form-input short-input"
          disabled
        />
        <button
          v-if="canDisplayOpenCalendarButton"
          class="btn btn-secondary short-input"
          @click="toggleAppointmentCalendarModal"
        >
          Choose from calendar
        </button>
      </div>

      <!-- Displays the chosen appointment type (if present) -->
      <div v-if="chosenAppointmentType.duration" class="form-field">
        <h4 class="form-heading">Appointment Type</h4>
        <AppointmentTypeContainer :type="chosenAppointmentType"></AppointmentTypeContainer>
      </div>

      <!-- Counsellor notes input -->
      <div v-if="userIsCounsellor" class="form-field">
        <h4 class="form-heading">Counsellor Notes</h4>
        <textarea v-model="counsellorNotes" class="form-input"></textarea>
      </div>

      <!-- Client Notes Input (Only for clients)-->
      <div v-else class="form-field">
        <h4 class="form-heading">Client Notes</h4>
        <p class="paragraph note"><span>Note:</span> These are viewable by your chosen counsellor</p>
        <textarea v-model="clientNotes" class="form-input"></textarea>
      </div>

      <!-- Submit form button-->
      <div class="form-field">
        <button @click="requestAppointment" class="btn btn-primary">Request Appointment</button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="form-field error">
      <h4 class="heading-4 error">{{ this.errorMessage }}</h4>
    </div>

    <!-- Calendar Modal -->
    <Modal v-on:close-modal="toggleAppointmentCalendarModal()" v-if="showAppointmentCalendar">
      <div class="calendar">
        <AppointmentCalendar
          userCanAddEvents
          v-on:close-modal="toggleAppointmentCalendarModal()"
          v-on:date-chosen="dateChosen"
          :clientAppointments="clientAppointments"
          :counsellor="chosenCounsellor"
        />
      </div>
    </Modal>
  </div>
</template>
<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";
import Modal from "@/components/layout/Modal";
import Utils from "@/utils";
import AppointmentTypeContainer from "@/components/misc/AppointmentTypeContainer";

export default {
  components: {
    AppointmentCalendar,
    Modal,
    AppointmentTypeContainer
  },

  computed: {
    // Call the store to determine whether the user is a counsellor or not.
    userIsCounsellor: function() {
      return this.$store.getters["authentication/isCounsellor"];
    },
    // Whether the user can open the calendar or not.
    canDisplayOpenCalendarButton() {
      if (this.userIsCounsellor) {
        // Must have chosen counsellor and client
        return this.chosenClient._id && this.chosenCounsellor._id;
      } else {
        // Must have chosen counsellor
        return this.chosenCounsellor._id;
      }
    },
    // Formats the date - 'September 4, 1986 8:30 PM'
    getFormattedChosenDate() {
      if (Utils.objIsEmpty(this.chosenStartTime)) return "No date chosen";
      return this.moment(this.chosenStartTime).format("LLL");
    }
  },
  data() {
    return {
      clientDates: [], // The dates where the user is busy
      counsellorDates: [], // The dates where the counsellor is busy
      businessHours: [], // Dates that the counsellor isn't available
      counsellors: [], // A list of all the counsellors
      clients: [], // All the clients
      chosenClient: {}, // The chosen client for the appointment
      chosenCounsellor: {}, // The counsellor the user has chosen
      chosenStartTime: {}, // The desired start time of the appointment
      chosenTitle: "", // The desired title of the appointment
      chosenAppointmentType: {}, // The desired type of the appointment
      clientNotes: "", // Any notes the client has about the appointment.
      counsellorNotes: "", // The notes the counsellor has made about the appointment.
      showAppointmentCalendar: false, // Whether to show the appointment calendar or not.
      errorMessage: "", // If there is an error message it is stored here.
      clientAppointments: [] // The client's appointments.
    };
  },
  props: {
    // The specific counsellor to have the appointment with.
    specificCounsellor: {}
  },
  methods: {
    // Validate any input from the user. This process is also repeated on the server.
    // Returns an object containing error and message.
    validateInput() {
      // Check if user has chosen a counsellor
      if (!this.chosenCounsellor._id) {
        return {
          error: true,
          message: "Please choose a counsellor for your appointment."
        };
      }
      // check to see if user has chosen a start time
      if (!this.chosenStartTime) {
        return {
          error: true,
          message: "Please choose a time and date for your appointment."
        };
      }

      // check to see if user has chosen a duration
      if (!this.chosenAppointmentType.duration) {
        return {
          error: true,
          message: "Please choose a valid appointment type for your appointment."
        };
      }

      // this check is only required for counsellors.
      // Check to see if the user has chosen a client.
      if (!this.chosenClient._id) {
        return {
          message: "Please choose a valid client"
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
        if (error) throw message;

        // build request body
        let appointment = {
          startTime: this.chosenStartTime,
          title: this.chosenTitle,
          typeId: this.chosenAppointmentType._id,
          counsellorId: this.chosenCounsellor._id,
          clients: [this.chosenClient._id],
          clientNotes: this.clientNotes,
          counsellorNotes: this.counsellorNotes
        };
        // send request
        let response = await AppointmentService.requestAppointment(appointment);
        // check for server error
        if (!response.data.success) {
          throw { response };
        }

        // Request was a success (appointment has been made).
        this.$emit("appointment-created");
      } catch (error) {
        // If the error is a string, use it to set the error message and return.
        if (Utils.isString(error)) {
          this.errorMessage = error;
          return;
        }

        // If there is clash information with the error message.
        if (error.response.data.clashInfo) {
          // Create an error message describing the clashing appointments:
          // "Appointment Clash: 4:00 PM - 4:50 PM is booked from Wednesday 5th to Wednesday 5th"
          let clashInfo = error.response.data.clashInfo;
          let startTime = this.moment(clashInfo.startTime);
          let endTime = this.moment(clashInfo.endTime);
          let endDay = startTime.clone().add(clashInfo.noFutureAppointments, "days");

          this.errorMessage = `Appointment Clash:\n${startTime.format("LT")} - ${endTime.format(
            "LT"
          )} is booked from ${startTime.format("dddd Do")} to ${endDay.format("dddd Do")}`;
          return;
        }

        this.errorMessage = error.response.data.message;
      }
    },

    // When a date has been chosen from the calendar, set the local state.
    dateChosen({ appointmentStartTime, appointmentType }) {
      this.chosenStartTime = appointmentStartTime;
      this.chosenAppointmentType = appointmentType;
    },

    // Gets all the appointments that involve the clients
    getAppointmentsOfClient: async function() {
      try {
        let result = await AppointmentService.getAppointmentsOfUser({
          userId: this.chosenClient._id,
          isCounsellor: false,
          reduced: true,
          params: {
            // Get the appointments from the start of the week.
            fromTime: this.moment()
              .startOf("week")
              .toString()
          }
        });
        return result.data.appointments;
      } catch (error) {
        this.errorMessage = error.response.data.message;
      }
    },

    // open and close appointment calendar
    toggleAppointmentCalendarModal() {
      this.showAppointmentCalendar = !this.showAppointmentCalendar;
    }
  },

  watch: {
    chosenCounsellor: async function() {
      // reset the chosen start time so the user has to choose a new one.
      this.chosenStartTime = undefined;
    },
    chosenClient: async function() {
      if (!this.chosenClient._id) return;
      // reset the chosen start time.
      this.chosenStartTime = undefined;

      // get client appointments
      this.clientAppointments = await this.getAppointmentsOfClient();
    }
  },

  async mounted() {
    // store user in local variable
    this.user = this.$store.state.authentication.user;

    try {
      if (this.userIsCounsellor) {
        // Fetch all the clients, as counsellors can choose their clients.
        this.clients = (await UserService.getAllClients()).data.clients;
      } else {
        // Clients can only book appointments with themselves as the client.
        this.chosenClient = this.user;
      }

      // If the appointment is for a specific counsellor, set that counsellor to be a chosen counsellor.
      if (this.specificCounsellor) {
        this.chosenCounsellor = this.specificCounsellor;
      } else {
        // Get all counsellors.
        this.counsellors = (await UserService.getAllCounsellors()).data.counsellors;
      }
    } catch (error) {
      this.errorMessage = error.response.data.message;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.request-form {
  margin: 2rem 0;

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
      margin-top: 0.25rem;
    }
  }
  .calendar-box {
    width: 100%;
    margin-top: 1.2rem;
  }
}

.error {
  white-space: pre;
}
.calendar {
  width: 110rem;
}

.calendar {
  margin-top: 2rem;
}
</style>
