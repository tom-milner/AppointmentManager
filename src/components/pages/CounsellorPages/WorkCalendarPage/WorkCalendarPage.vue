<template>
  <div class="wrapper">
    <!-- Work Day Settings -->
    <h2 class="heading-2">Work Calendar</h2>
    <!-- Free days input -->
    <div class="container">
      <h3 class="heading-3">Available Work Days</h3>
      <div class="working-days-buttons">
        <button
          @click="updateWorkingDays(day)"
          v-for="day in workDays"
          :key="day"
          class="btn btn-approved"
          v-bind:class="{checked : isDayAvailable(day) }"
        >{{day}}</button>
      </div>
    </div>

    <!-- Working hours input -->
    <div v-if="availableWorkDays.length >0" class="container">
      <h3 class="heading-3">Available Work Hours (start / end) ?</h3>
      <div class="working-hours-input">
        <div v-bind:key="day.name" v-for="day in availableWorkDays" class="day">
          <h4 class="heading-4">{{day.name}}</h4>
          <input step="3600" type="time" v-model="day.startTime" class="form-input time-select" />
          <input step="3600" type="time" v-model="day.endTime" class="form-input time-select" />
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="container">
      <button @click="saveSettings" class="btn btn-primary save-button">Save</button>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import WorkDay from "@/models/WorkDay";

export default {
  components: {},

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
    let counsellorId = this.$store.state.authentication.user._id;
    let result = await UserService.getCounsellor(counsellorId);
    this.counsellor = result.data.counsellor;
    this.availableWorkDays = this.counsellor.workingDays;
  },

  methods: {
    sortAvailableWorkDays() {
      console.log("sorting");
      // sort available week days
      let days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];
      this.availableWorkDays = this.availableWorkDays.sort(function(a, b) {
        console.log(days.indexOf(a.name) > days.indexOf(b.name));
        return days.indexOf(a.name) > days.indexOf(b.name);
      });
    },

    formatTime(time) {
      console.log("raw: ", time);
      let formattedTime = this.moment(time);
      return formattedTime;
    },
    isDayAvailable(chosenDay) {
      return this.availableWorkDays.find(day => day.name == chosenDay);
    },

    // This function updates the local state of availableWorkDays whenever a button is pressed.
    updateWorkingDays(currentDay) {
      // check if day is already in counsellor settings
      let dayFound = this.isDayAvailable(currentDay);
      if (dayFound) {
        // remove day from array
        let index = this.availableWorkDays.indexOf(dayFound);
        this.availableWorkDays.splice(index, 1);
      } else {
        // add day
        this.availableWorkDays.push(new WorkDay(currentDay));
      }
    },

    saveSettings() {
      UserService.updateCounsellor(this.counsellor._id, {
        workingDays: this.availableWorkDays
      });
    }
  }
};
</script>

<style  lang="scss" scoped>
.container {
  margin-top: 5rem;
  .working-days-buttons {
    margin-top: 1rem;
    button {
      &:not(:last-child) {
        margin-right: 2rem;
      }
    }
  }

  .working-hours-input {
    margin-top: 1rem;

    .day {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 10rem;
      display: inline-block;
      text-align: center;

      &:not(:last-child) {
        margin-right: 4rem;
      }

      h4 {
        font-weight: 300;
      }

      .time-select {
        font-size: 1.5rem;
        display: block;
      }
    }
  }
  .save-button {
    width: 30rem;
  }
}
</style>
