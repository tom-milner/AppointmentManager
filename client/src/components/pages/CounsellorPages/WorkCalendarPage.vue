<!--
  This file is for the WorkCalendarPage component.
  The work calendar page is for the counsellor to manage what days they are working on,
  and what times they are working for each day.

-->
<template>
  <div class="wrapper">
    <!-- Work Day Settings -->
    <h2 class="heading-2">Work Times</h2>
    <!-- Free days input -->
    <div class="container">
      <h3 class="heading-3">Available Work Days</h3>
      <div class="working-days-buttons">
        <button
          @click="updateWorkingDays(day)"
          v-for="day in workDays"
          :key="day"
          class="btn btn-approved"
          v-bind:class="{ checked: isDayAvailable(day) }"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <!-- Working hours input -->
    <div v-if="availableWorkDays.length > 0" class="container">
      <h3 class="heading-3">Available Work Hours</h3>
      <div class="working-hours-input">
        <div class="label">
          <h4 class="heading-4">Start</h4>
          <h4 class="heading-4">End</h4>
        </div>

        <div v-bind:key="day.name" v-for="day in availableWorkDays" class="day">
          <h4 class="heading-4">{{ day.name }}</h4>
          <input
            step="3600"
            type="time"
            :max="day.endTime"
            min="00:00"
            v-model="day.startTime"
            class="form-input time-select"
          />
          <input
            step="3600"
            type="time"
            :min="day.startTime"
            max="23:59"
            v-model="day.endTime"
            class="form-input time-select"
          />
        </div>
      </div>
    </div>
    <h2 class="container not-working" v-else>You are not working this week!</h2>

    <!-- Save Button -->
    <div class="container save">
      <button @click="saveSettings" class="btn btn-primary save-button">Save</button>
      <h4 class="heading-4 error message" :class="{ success: message.success }">{{ message.contents }}</h4>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";

// WorkDay model for easy manipulation of work days.
function WorkDay(name, startTime, endTime) {
  this.name = name;
  this.startTime = startTime;
  this.endTime = endTime;
}

export default {
  data() {
    return {
      counsellor: {}, // The current counsellor.
      message: {
        // The success/error message.
        success: false,
        contents: ""
      },
      workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      availableWorkDays: [] // The days the counsellor can work
    };
  },
  async mounted() {
    // Get the counsellor.
    this.counsellor = this.$store.state.authentication.user;
    this.availableWorkDays = this.counsellor.workingDays;
  },
  watch: {
    message: {
      // Remove the message after 2 seconds.
      deep: true,
      handler(val) {
        if (val.contents != "")
          // Only if the message contains text. (So that this won't trigger an infinite loop).
          setTimeout(
            function() {
              this.setMessage("");
            }.bind(this),
            5000
          );
      }
    }
  },
  methods: {
    // Set the error/success message
    setMessage(message, success) {
      this.message.contents = message;
      this.message.success = success;
    },

    // Check that the supplied day is available.
    isDayAvailable(chosenDay) {
      // Find the day in the available work days.
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
        // add day (Set times to default 9-5)
        this.availableWorkDays.push(new WorkDay(currentDay, "09:00", "17:00"));
        this.sortAvailableWorkDays();
      }
    },
    sortAvailableWorkDays() {
      // sort available week days
      let days = this.workDays;
      return this.availableWorkDays.sort((a, b) => days.indexOf(a.name) - days.indexOf(b.name));
    },

    // Save the counsellor settings.
    async saveSettings() {
      let response;
      try {
        response = await UserService.updateUser(
          this.counsellor._id,
          {
            workingDays: this.availableWorkDays
          },
          true // The user is a counsellor.
        );
      } catch (error) {
        response = error.response;
      }
      this.setMessage(response.data.message, response.data.success);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.container {
  margin-top: 5rem;

  .not-working {
    margin-top: 2rem;
  }

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
        margin-top: 0.3rem;
      }
    }

    .label {
      display: inline-block;
      width: 7rem;
      vertical-align: sup;
      h4 {
        &:first-child {
          margin-bottom: 1rem;
        }
        padding: 0;
        font-size: 1.8rem;
      }
    }
  }
  &.save {
    display: inline-block;
    width: 50%;
    .message {
      display: inline !important;
      margin-left: 2rem;
    }
    .save-button {
      width: 20rem;
      display: inline-block;
    }
  }
}
</style>
