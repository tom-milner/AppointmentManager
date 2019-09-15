<template>
  <div>
    <div class="headers">
      <h2 class="dialogue-header heading-2">Add Appointment</h2>
      <h3 class="dialogue-date heading-3">{{getFormattedDate}}</h3>
    </div>
    <div class="segment">
      <h3 class="form-heading">Choose a start time:</h3>
      <select v-model="chosenTime" class="form-input select">
        <option
          v-for="timeSlot in timeSlots"
          :value="timeSlot"
          :key="timeSlot.startTime.toString()"
        >{{getFormattedTimeSlot(timeSlot)}}</option>
      </select>
    </div>
    <div class="segment">
      <h3 class="form-heading">Choose a duration:</h3>
      <!-- TODO: store durations in backend -->
      <select v-model="chosenDuration" class="form-input select">
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
import Utils from "@/utils";
export default {
  data() {
    return {
      errorMessage: "",
      chosenTime: this.moment().startOf("day"),
      // 10 minutes between appointments
      appointmentBufferTime: 10,
      notes: String,
      // TODO: store these in backend
      durationOptions: [50],

      // 50 mins is default
      chosenDuration: 50,
      timeSlots: []
    };
  },
  props: {
    day: {},
    dayEvents: {},
    businessHours: {}
  },
  computed: {
    getFormattedDate() {
      return this.moment(this.day.date).format("Do MMM Y");
    }
  },
  beforeMount() {
    this.getAppointmentTimeSlots();
    console.log(this.timeSlots.length);
  },
  methods: {
    closeDialogue() {
      this.$emit("close-dialogue");
    },
    chooseTime() {
      // data validation - no need for seperate function as we are only checking two variables
      if (!this.chosenTime.startTime._isAMomentObject) {
        this.errorMessage = "Please choose a valid time.";
        console.log(this.chosenTime);
      } else if (this.chosenDuration == 0) {
        this.errorMessage = "Please choose a valid duration.";
      } else {
        this.$emit("close-dialogue");
        let appointmentStartTime = this.chosenTime.startTime;
        let appointmentDuration = this.chosenDuration;
        this.$emit("date-chosen", {
          appointmentStartTime,
          appointmentDuration
        });
      }

      console.log(this.errorMessage);
    },
    getAppointmentTimeSlots() {
      // create new timeslots
      let dayStart = Utils.getMomentFromTimeString(
        this.day.date,
        this.businessHours.startTime
      );
      let dayEnd = Utils.getMomentFromTimeString(
        this.day.date,
        this.businessHours.endTime
      );

      // The times already booked by clients
      let disabledTimes = this.dayEvents.map(event => this.moment(event.start));
      console.log(disabledTimes);

      // You can only schedule 1 appointment per hour
      let oneHour = this.moment.duration(1, "hour");
      let appointmentDuration = this.moment.duration(
        this.chosenDuration,
        "minutes"
      );

      let timeSlots = [];
      let firstTimeSlot = {};
      firstTimeSlot.startTime = dayStart;
      firstTimeSlot.endTime = this.moment(dayStart).add(appointmentDuration);

      timeSlots.push(firstTimeSlot);

      // TODO: currently fiddling with timeslots so that counsellor can choose off-hour appointments without too much affect in behaviour

      // create timeSlots
      let lastTimeSlot = firstTimeSlot;
      while (!lastTimeSlot.startTime.isSameOrAfter(dayEnd)) {
        // calculate new time slot
        let nextTimeSlot = {};
        nextTimeSlot.startTime = this.moment(lastTimeSlot.startTime).add(
          oneHour
        );
        nextTimeSlot.endTime = this.moment(nextTimeSlot.startTime).add(
          appointmentDuration
        );

        // check if it is disabled
        let alreadyBooked = disabledTimes.some(timeSlot => {
          timeSlot.isBetween(nextTimeSlot.startTime, nextTimeSlot.endTime);
          return timeSlot.isBetween(
            nextTimeSlot.startTime,
            nextTimeSlot.endTime,
            null,
            []
          );
        });

        lastTimeSlot = nextTimeSlot;

        if (alreadyBooked) break;

        // add to timeslot array
        timeSlots.push(lastTimeSlot);
        // NOTE: first slot of day is already added^^!!!
      }

      this.timeSlots = timeSlots;
    },
    getFormattedTimeSlot(timeSlot) {
      return timeSlot.startTime.format("HH:mm");
    }
  },
  watch: {
    chosenTime: function(newVal) {
      // make sure user has chosen time and duration

      let date = this.moment(this.day.date).format("YYYY MM DD");
      let time = newVal;
      let dateTime = date + " " + time;
      this.chosenDateTimeMoment = this.moment(dateTime);
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

.select {
  font-size: 1.5rem;
  height: auto;
}

.segment {
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}
</style>