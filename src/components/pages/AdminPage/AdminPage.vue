<template>
  <div class="wrapper">
    <h1 class="heading-2">Your Work Calendar</h1>
    <div class="container">
      <h3 class="heading-3">What days are you free to work?</h3>
      <div class="working-days">
        <button
          @click="updateWorkingDays(day)"
          v-for="day in workDays"
          :key="day"
          class="secondary-btn"
          v-bind:class="{checked : isDayAvailable(day) }"
        >{{day}}</button>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
export default {
  data() {
    return {
      counsellor: {},
      appointments: [],
      workDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      availableWorkDays: []
    };
  },
  async mounted() {
    this.counsellor = this.$store.state.authentication.user;
    console.log(this.counsellor);
    this.availableWorkDays = this.counsellor.workingDays;
  },

  methods: {
    isDayAvailable(day) {
      console.log(this.availableWorkDays.includes(day));
      return this.availableWorkDays.includes(day);
    },
    updateWorkingDays(day) {
      console.log("updating");
      // check if day is already in counsellor settings
      if (!this.availableWorkDays.includes(day)) {
        // add day
        this.availableWorkDays.push(day);
      } else {
        // remove day from array
        let index = this.availableWorkDays.indexOf(day);
        this.availableWorkDays.splice(index, 1);
      }

      // update counsellor settings
      UserService.updateCounsellor(
        {
          workingDays: this.availableWorkDays
        },
        this.counsellor._id
      );
    }
  }
};
</script>

<style  lang="scss" scoped>
.container {
  margin-top: 5rem;

  .working-days {
    margin-top: 1rem;
    button {
      &:not(:last-child) {
        margin-right: 2rem;
      }
    }
  }
}
</style>
