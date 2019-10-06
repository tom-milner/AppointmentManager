<template>
  <div>
    <!-- Form -->
    <div class="request-form">
      <!-- Appointment Title -->
      <div class="form-field">
        <h4 class="form-heading">Appointment Title</h4>
        <input v-model="chosenTitle" class="form-input short-input" />
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
          <option
            v-for="counsellor in counsellors"
            :key="counsellor._id"
            :value="counsellor"
          >{{counsellor.firstname}} {{counsellor.lastname}}</option>
        </select>
        <h4 v-else class="heading-4">{{chosenCounsellor.firstname}} {{chosenCounsellor.lastname}}</h4>
      </div>

      <!-- Client selection dropdown - only for counsellors!! -->
      <div class="form-field" v-if="userIsCounsellor">
        <h4 class="form-heading">Client</h4>
        <select class="form-input short-input select" v-model="chosenClient">
          <option
            v-for="client in clients"
            :key="client._id"
            :value="client"
          >{{client.firstname}} {{client.lastname}}</option>
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
        <div
          v-if="canDisplayOpenCalendarButton"
          class="btn btn-secondary short-input"
          @click="toggleAppointmentCalendarModal"
        >Choose from calendar</div>
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
        <p class="paragraph note">
          <span>Note:</span> These are viewable by your chosen counsellor
        </p>
        <textarea v-model="clientNotes" class="form-input"></textarea>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="form-field error">
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
          :events="{ counsellorEvents: counsellorDates, clientEvents:clientDates}"
          :businessHours="businessHours"
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
import Role from "@/models/Role";
import AppointmentTypeContainer from "@/components/misc/AppointmentTypeContainer";

export default {
  components: {
    AppointmentCalendar,
    Modal,
    AppointmentTypeContainer
  },

  computed: {
    userIsCounsellor() {
      return this.user.role >= Role.Counsellor;
    },
    // whether the user can open the calendar or not
    canDisplayOpenCalendarButton() {
      if (this.userIsCounsellor) {
        // must have chosen counsellor and client
        return this.chosenClient._id && this.chosenCounsellor._id;
      } else {
        // must have chosen counsellor
        return this.chosenCounsellor._id;
      }
    },
    // Formats the date
    getFormattedChosenDate() {
      if (Utils.objIsEmpty(this.chosenStartTime)) return "No date chosen";
      return this.moment(this.chosenStartTime).format("LLL");
    }
  },
  data() {
    return {
      user: {},
      clientDates: [], // the dates where the user is busy
      counsellorDates: [], // the dates where the counsellor is busy
      businessHours: [], // dates that the counsellor isn't available
      counsellors: [], // a list of all the counsellors
      clients: [], // all the clients
      chosenClient: {}, // the chosen client for the appointment
      chosenCounsellor: {}, // the counsellor the user has chosen
      chosenStartTime: {}, // the desired start time of the appointment
      chosenTitle: "", // the desired title of the appointment
      chosenAppointmentType: {}, // the desired type of the appointment
      clientNotes: "", // any notes the client (current user) has about the appointment.
      counsellorNotes: "",
      appointmentCalendarDisplayed: false,
      errorMessage: "" // if there is an error message it is stored here.
    };
  },
  props: {
    specificCounsellor: {}
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
          message:
            "Please choose a valid appointment type for your appointment."
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
          clientId: this.chosenClient._id,
          clientNotes: this.clientNotes,
          counsellorNotes: this.counsellorNotes
        };
        // send request
        let response = await AppointmentService.requestAppointment(appointment);
        // check for server error
        if (!response.data.success) {
          throw { response };
        }

        // request was a success (appointment has been made) - redirect user
        this.$router.push("/home");
      } catch (error) {
        console.log(error);
        if (Utils.isString(error)) {
          this.errorMessage = error;
          return;
        }
        console.log(error.response.data);
        if (error.response.data.clashInfo) {
          let clashInfo = error.response.data.clashInfo;
          let formattedStart = this.moment(clashInfo[0].startTime).format("LT");
          let formattedEnd = this.moment(clashInfo[0].endTime).format("LT");
          let day = this.moment(clashInfo[0].startTime).format("dddd");
          this.errorMessage = `Appointment Clash:\n${day}, ${formattedStart} - ${formattedEnd} is booked for the next ${clashInfo[0].noFutureAppointments} weeks.`;
          return;
        }
        this.errorMessage = error.response.data.message;
      }
    },

    // when a date has been chosen from the calendar, set the local state.
    dateChosen({ appointmentStartTime, appointmentType }) {
      this.chosenStartTime = appointmentStartTime;
      this.chosenAppointmentType = appointmentType;
    },

    // gets all the appointments that involve the clients
    getAppointmentsOfClient: async function() {
      // get appointments of current user
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.chosenClient._id,
        isCounsellor: false,
        params: {
          fromTime: this.moment()
            .startOf("week")
            .toString()
        }
      })).data.appointments;
      return result;
    },

    // get all the appointments that involve the counsellor.
    getAppointmentsOfCounsellor: async function() {
      // get appointments
      let result = (await AppointmentService.getAppointmentsOfUser({
        userId: this.chosenCounsellor._id,
        isCounsellor: true,
        reduced: true,
        params: {
          fromTime: this.moment()
            .startOf("week")
            .toString()
        }
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

      // reset the chosen start time.
      this.chosenStartTime = undefined;

      // update disabledDates with the dates the counsellor can't make
      this.createBusinessHours();

      // get counsellor appointments.
      let counsellorAppointments = await this.getAppointmentsOfCounsellor();
      this.counsellorDates = this.mapAppointmentsToDates(
        counsellorAppointments
      );
    },
    chosenClient: async function() {
      if (!this.chosenClient._id) return;
      // reset the chosen start time.
      this.chosenStartTime = undefined;

      // get client appointments
      if (this.chosenClient.role >= Role.Client) {
        let clientAppointments = await this.getAppointmentsOfClient();
        this.clientDates = this.mapAppointmentsToDates(clientAppointments);
      }
    }
  },

  async mounted() {
    // store user in local variable
    this.user = this.$store.state.authentication.user;
    console.log(this.user);
    if (this.userIsCounsellor) {
      this.clients = (await UserService.getAllClients()).data.clients;
    } else {
      this.chosenClient = this.user;
    }

    if (this.specificCounsellor) {
      this.chosenCounsellor = this.specificCounsellor;
    } else {
      // get all counsellors
      this.counsellors = (await UserService.getAllCounsellors()).data.counsellors;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.request-form {
  margin: 2rem 0;
  // width: 40%;

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

.error {
  white-space: pre;
}
.modal-content {
  width: 110rem;
}
</style>
