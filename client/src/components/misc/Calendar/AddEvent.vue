<template>
  <div>
    <!-- The popup's headers -->
    <div class="headers">
      <h2 class="dialogue-header heading-2">Add Appointment</h2>
      <h3 class="dialogue-date heading-3">{{getFormattedDate}}</h3>
    </div>

    <!-- Appointment Type Dropdown -->
    <div v-if="!!!appointmentType" class="segment">
      <h4 class="form-heading">Choose an appointment type:</h4>
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
      <h4 class="form-heading">Choose a time slot:</h4>
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

    <!-- Recurring -->
    <div v-if="chosenAppointmentType._id && !!!appointmentType" class="segment recurring">
      <h4 class="form-heading">Is it recurring?</h4>
      <h4
        class="heading-4"
        :class="{'success': chosenAppointmentType.isRecurring,
        'error': !chosenAppointmentType.isRecurring}"
      >{{chosenAppointmentType.isRecurring ? "Yes" : "No"}}</h4>
      <h4
        v-if="chosenAppointmentType.isRecurring"
        class="form-heading"
      >{{chosenAppointmentType.recurringDuration}} weeks.</h4>
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

  &.recurring {
    h4 {
      display: inline;
      margin-right: 2rem;

      &.heading-4 {
        margin-right: 1rem;
      }
    }
  }
}
</style>


<script>
import Utils from "@/utils";
import AppointmentTypeService from "@/services/AppointmentTypeService";
export default {
  data() {
    return {
      errorMessage: "",
      chosenTime: {},
      timeSlots: [],
      // appointment buffer time
      appointmentTypes: {},
      chosenAppointmentType: {}
    };
  },
  props: {
    day: {},
    dayEvents: {},
    businessHours: {},
    appointmentBufferTime: Number,
    appointmentType: {}
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
    if (this.appointmentType) {
      this.chosenAppointmentType = this.appointmentType;
    } else {
      // get all the appointment types
      this.appointmentTypes = (await AppointmentTypeService.getAppointmentTypes()).data.appointmentTypes;
    }
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

      // create a moment duration of the duration of the appointment type.
      let appointmentDuration = this.moment.duration(
        this.chosenAppointmentType.duration,
        "minutes"
      );

      // initialize empty timeSlots array
      let timeSlots = [];

      // set last time slot to be the first time slot.
      let lastTimeSlot = {};
      lastTimeSlot.startTime = dayStart;
      lastTimeSlot.endTime = this.moment(dayStart).add(appointmentDuration);

      // You can only schedule 1 appointment per hour
        let oneHour = this.moment.duration(1, "hour");

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

      this.timeSlots = filteredTimeSlots;
    },

    filterTimeSlots(timeSlots) {
      // create moment objects
      let bufferTime = this.appointmentBufferTime;

      let bookedTimes = this.dayEvents.map(event => ({
        startTime: this.moment(event.start).subtract(bufferTime, "minutes"),
        endTime: this.moment(event.end).add(bufferTime, "minutes")
      }));

      let filteredTimeSlots = [];
      timeSlots.forEach(timeSlot => {
        // find the index of any disabled times.
    
        let conflictingAppoinment = bookedTimes.find(bookedTime => {
          // check to see if there are conflicting appointments

          return (
            timeSlot.startTime.isBetween(
              bookedTime.startTime,
              bookedTime.endTime,
              null,
              "()"
            ) ||
            timeSlot.endTime.isBetween(
              bookedTime.startTime,
              bookedTime.endTime,
              null,
              "()"
            )
          );
        });

        if (!conflictingAppoinment) {
          filteredTimeSlots.push(timeSlot);
        }
      });

      // return filtered time slots.
      return filteredTimeSlots;
    },

    getFormattedTimeSlot(timeSlot) {
      return (
        timeSlot.startTime.format("HH:mm") +
        " - " +
        timeSlot.endTime.format("HH:mm")
      );
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