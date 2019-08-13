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
        <input class="form-input" />
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

// TODO: get times when counsellor is unavailable

export default {
  components: {},
  data() {
    return {
      user: {},
      disabledDates: [],
      userAppointments: [],
      counsellorAppointments: [],
      chosenCounsellor: {}
    };
  },
  methods: {
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
    this.user = this.$store.state.authentication.user;
    await this.getUnavailableTimeSlotsOfClient();
    this.disabledDates = this.mapAppointmentsToDates(this.userAppointments);
    console.log(this.disabledDates);
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
}
</style>
