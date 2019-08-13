<template>
  <div>
    <h1 class="heading-2">Request An Appointment</h1>
    <div class="request-form">
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
        <input class="form-input" />
      </div>

      <div class="form-field">
        <h3 class="form-heading">Counsellor</h3>
        <div class="dropdown-container">
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
        <v-calendar :disabled-dates="disabledDates" is-expanded></v-calendar>
      </div>
    </div>
  </div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
import Dropdown from "@/components/layout/Dropdown";

export default {
  components: {
    Dropdown
  },
  data() {
    return {
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
    chosenCounsellor: function() {}
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

.request-form {
  margin-top: 2rem;

  .form-field {
    max-width: 50rem;
    width: auto;
    &:not(:last-of-type) {
      margin-bottom: 1rem;
    }
  }

  .dropdown-container {
  }
}
</style>
