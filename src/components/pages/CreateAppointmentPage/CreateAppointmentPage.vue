<template>
  <div>
    <h1 class="heading-2">Request An Appointment</h1>
    <div class="request-form">
      <div class="form-field">
        <h3 class="form-heading">Appointment Title</h3>
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
import UserService from "@/services/UserService";

// TODO: get times when counsellor is unavailable

export default {
  components: {},
  data() {
    return {
      user: {},
      disabledDates: [],
      chosenCounsellor: {}
    };
  },
  methods: {
    // gets all the appointments in the future that involve the clients
    getUnavailableTimeSlotsOfUser: async function(userId) {
      // get future appointments of current user
      let userAppointments = (await UserService.getFutureAppointmentsOfUser(
        userId
      )).data.futureAppointments;

      // turn appointments into date ranges
      let dates = userAppointments.map(appointment => {
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
  mounted() {
    this.user = this.$store.state.authentication.user;
    this.getUnavailableTimeSlotsOfUser(this.user.id);
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
