<template>
  <div>
    <!-- The popup's headers -->
    <div class="headers">
      <h2 class="dialogue-header heading-2">Add Appointment</h2>
      <h3 class="dialogue-date heading-3">{{getFormattedDate}}</h3>
    </div>

    <!-- Appointment Type Dropdown -->
    <div class="segment">
      <h3 class="form-heading">Choose an appointment type:</h3>
      <select v-model="chosenAppointmentType" class="form-input select">
        <option
          v-for="type in appointmentTypes"
          :key="type._id"
          :value="type"
        >{{type.name}} - {{type.duration}} minutes</option>
      </select>
    </div>

    <!-- Start Time Input -->
    <div class="segment">
      <h3 class="form-heading">Choose a start time:</h3>
      <select
        :disabled="!!!chosenAppointmentType.duration"
        v-model="chosenTime"
        class="form-input select"
      >
        <option
          v-for="timeSlot in timeSlots"
          :value="timeSlot"
          :key="timeSlot.startTime.toString()"
        >{{getFormattedTimeSlot(timeSlot)}}</option>
      </select>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage.length > 0" class="segment">
      <h4 class="heading-4 error">{{errorMessage}}</h4>
    </div>

    <!-- Choose time button -->
    <div class="segment">
      <div @click="timeChosen" class="btn btn-primary">Choose Time</div>
    </div>
  </div>
</template>

<script>
import Utils from "@/utils";
import AppointmentTypeService from "@/services/AppointmentTypeService";
export default {
  data() {
    return {
      errorMessage: "",
      chosenTime: {},
      // 10 minutes between appointments
      appointmentBufferTime: 10,
      notes: String,
      timeSlots: [],
      appointmentTypes: {},
      chosenAppointmentType: {}
    };
  },
  props: {
    day: {},
    dayEvents: {},
    businessHours: {}
  },
  computed: {
    getFormattedDate() {
      return this.moment(this.day.start).format("Do MMM Y");
    }
  },
  beforeMount() {
    this.getPossibleTimeSlots();
  },
  async mounted() {
    // get all the appointment types
    this.appointmentTypes = (await AppointmentTypeService.getAppointmentTypes()).data.appointmentTypes;
  },
  methods: {
    timeChosen() {
      // data validation - no need for seperate function as we are only checking two variables
      if (!this.chosenAppointmentType.duration) {
        this.errorMessage = "Please choose a valid appointment type.";
        return;
      }
      if (!this.chosenTime.startTime) {
        this.errorMessage = "Please choose a valid time.";
        return;
      }

      // emit an event to send the information back to CreateAppointmentPage
      let appointmentStartTime = this.chosenTime.startTime;
      let appointmentType = this.chosenAppointmentType;
      this.$emit("date-chosen", {
        appointmentStartTime,
        appointmentType
      });
    },
    getPossibleTimeSlots() {
      if (
        this.businessHours == null ||
        this.businessHours.length > 0 ||
        this.chosenAppointmentType.duration == null
      )
        return;

      // get the start and end of the day as moment objects.
      let dayStart = Utils.getMomentFromTimeString(
        this.day.start,
        this.businessHours.startTime
      );
      let dayEnd = Utils.getMomentFromTimeString(
        this.day.start,
        this.businessHours.endTime
      );

      // You can only schedule 1 appointment per hour
      let oneHour = this.moment.duration(1, "hour");
      // create a moment duration of the duration of the appointment type.
      let appointmentDuration = this.moment.duration(
        this.chosenAppointmentType.duration,
        "minutes"
      );

      // initialize empty timeSlots array
      let timeSlots = [];

      // set last time slot to be the first time slot.
      let firstTimeSlot = {};
      firstTimeSlot.startTime = dayStart;
      firstTimeSlot.endTime = this.moment(dayStart).add(appointmentDuration);
      let lastTimeSlot = firstTimeSlot;

      // until we've reached the end of the day
      while (!lastTimeSlot.endTime.isSameOrAfter(dayEnd)) {
        timeSlots.push(lastTimeSlot);

        // calculate the next time slot
        let nextTimeSlot = {};
        nextTimeSlot.startTime = this.moment(lastTimeSlot.startTime).add(
          oneHour
        );
        nextTimeSlot.endTime = this.moment(nextTimeSlot.startTime).add(
          appointmentDuration
        );
        lastTimeSlot = nextTimeSlot;
      }

      // filter out disabled appointments.
      let filteredTimeSlots = this.filterTimeSlots(timeSlots);

      filteredTimeSlots.forEach(slot => {
        console.log(
          slot.startTime.format("HH:mm"),
          slot.endTime.format("HH:mm")
        );
      });
      this.timeSlots = filteredTimeSlots;
    },

    filterTimeSlots(timeSlots) {
      // create moment objects
      let disabledTimes = this.dayEvents.map(event => ({
        startTime: this.moment(event.start),
        endTime: this.moment(event.end)
      }));

      // filter out disabled events from timeslots.
      disabledTimes.forEach(disabledTime => {
        // find the index of any clashing timeSlots
        let alreadyBookedIndex = timeSlots.findIndex(timeSlot => {
          // check to see if the timeslot starts or ends during a disabled time.
          return (
            timeSlot.startTime.isBetween(
              disabledTime.startTime,
              disabledTime.endTime,
              null,
              [] // [] indicates inclusivity
            ) ||
            timeSlot.endTime.isBetween(
              disabledTime.startTime,
              disabledTime.endTime,
              null,
              [] // [] indicates inclusivity
            )
          );
        });
        // remove timeSlot from list.
        if (alreadyBookedIndex) timeSlots.splice(alreadyBookedIndex, 1);
      });
      // return filtered time slots.
      return timeSlots;
    },

    getFormattedTimeSlot(timeSlot) {
      return timeSlot.startTime.format("HH:mm");
    }
  },
  watch: {
    chosenAppointmentType: function() {
      // work out new available time slots.
      this.getPossibleTimeSlots();
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

.segment {
  &:not(:last-child) {
    margin-bottom: 2rem;
  }
}
</style>