<template>
  <div>
    <div class="headers">
      <h2 class="dialogue-header heading-2">Add Appointment</h2>
      <h3 class="dialogue-date heading-3">{{formattedDate}}</h3>
    </div>
    <div class="segment">
      <h3 class="form-heading">Choose a start time:</h3>
      <TimePicker
        v-model="chosenTime"
        format="hh:mm a"
        formatted="hh:mm a"
        minuteInterval="30"
        noLabel
        inputSize="sm"
        onlyTime
        :disabled-hours="disabledHours"
      ></TimePicker>
    </div>
    <div class="segment">
      <h3 class="form-heading">Choose a duration:</h3>
      <!-- TODO: store durations in backend -->
      <select v-model="chosenDuration" class="form-input duration-select">
        <option
          :value="duration"
          :key="duration"
          v-for="duration in durationOptions"
        >{{duration}} minutes</option>
      </select>
    </div>
    <div v-if="errorMessage.length > 0" class="segment">
      <h4 class="heading-4 error">{{errorMessage}}</h4>
    </div>

    <div class="segment">
      <div @click="chooseTime" class="btn btn-primary">Choose Time</div>
    </div>
  </div>
</template>

<script>
import TimePicker from "vue-ctk-date-time-picker";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";

export default {
  data() {
    return {
      errorMessage: "",
      chosenTime: this.moment().startOf("day"),
      chosenDuration: 0,
      chosenDateTime: {},
      // 10 minutes between appointments
      appointmentBufferTime: 10,
      notes: String,
      durationOptions: [50]
    };
  },
  components: {
    TimePicker
  },
  props: {
    day: {},
    dayEvents: {}
  },
  methods: {
    closeDialogue() {
      this.$emit("close-dialogue");
    },
    chooseTime() {
      // data validation - no need for seperate function as we are only checking two variables
      if (!this.chosenDateTime._isAMomentObject) {
        this.errorMessage = "Please choose a valid time.";
      } else if (this.chosenDuration == 0) {
        this.errorMessage = "Please choose a valid duration.";
      } else {
        this.$emit("close-dialogue");
        let appointmentStartTime = this.chosenDateTime;
        let appointmentDuration = this.chosenDuration;
        this.$emit("date-chosen", {
          appointmentStartTime,
          appointmentDuration
        });
      }

      console.log(this.errorMessage);
    }
  },
  watch: {
    chosenTime: function(newVal) {
      // make sure user has chosen time and duration

      let date = this.moment(this.day.date).format("YYYY MM DD");
      let time = newVal;
      let dateTime = date + " " + time;
      this.chosenDateTime = this.moment(dateTime);
    }
  },
  computed: {
    formattedDate() {
      return this.moment(this.day.date).format("Do MMM Y");
    },
    disabledHours() {
      return this.dayEvents.map(event => this.moment(event.start).format("HH"));
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.headers {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  .dialogue-date {
    text-align: right;
  }
  .dialoge-header {
    text-align: left;
  }
}

.duration-select {
  font-size: 1.5rem;
  height: auto;
}

.segment {
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}
</style>