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
        >{{day}}</button>
      </div>
    </div>
  </div>
</template>

<script>
// import AppointmentService from "@/services/AppointmentService";
export default {
  data() {
    return {
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
  methods: {
    updateWorkingDays(day) {
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
