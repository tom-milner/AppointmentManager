<template>
  <div class="wrapper">
    <div v-on-clickaway="closeDialogue" class="add-event-dialogue" :style="positionStyle">
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
          class="time-picker"
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
  </div>
</template>

<script>
import Utils from "@/utils";
import { mixin as clickaway } from "vue-clickaway";
import TimePicker from "vue-ctk-date-time-picker";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";

export default {
  data() {
    return {
      errorMessage: "",
      elementWidth: 40,
      elementHeight: 35,
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
  mixins: [clickaway],
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
    },

    positionStyle: function() {
      // TODO: clean up function (variable names etc)
      // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
      // it also positions the dialogue somewhere not off the screenzs
      let elementX, elementY;
      // get window dimensions
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      // convert dimensions of the dialogue box into pixels
      let elementHeightPx = Utils.convertRemToPixels(this.elementHeight);
      let elementWidthPx = Utils.convertRemToPixels(this.elementWidth);

      // buffer x and y to make dialogue look more natural
      let bufferY = 10;
      let bufferX = 10;

      let dayRectangle = this.day.dayEl.getBoundingClientRect();

      // check to see if the day on the calendar is on the left or right side of the screen
      if (dayRectangle.left <= windowWidth / 2) {
        // on the left - move the dialogue box to the right (where there is more space)
        elementX = dayRectangle.left + dayRectangle.width + bufferX;
      } else {
        // on the right - move dialogue box to the left
        elementX = dayRectangle.left - elementWidthPx - bufferX;
      }

      // check to see if the dialoge will fit on the screen
      if (dayRectangle.top >= windowHeight - elementHeightPx) {
        // dialogue won't fit - move it up so that it does
        elementY = windowHeight - elementHeightPx - bufferY;
      } else {
        // dialogue fits
        elementY = dayRectangle.top + bufferY;
      }
      return {
        position: "fixed",
        left: `${elementX}px`,
        top: `${elementY}px`,
        width: `${this.elementWidth}rem`,
        minHeight: `${this.elementHeight}rem`
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../../scss/global.scss";

// wrapper so other actions can't be triggered when user click outside the box.
.wrapper {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9000000;
}

.add-event-dialogue {
  z-index: 10000000;
  box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
  background-color: $color-white;
  border-radius: 10px;

  padding: 2rem;

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
}
</style>