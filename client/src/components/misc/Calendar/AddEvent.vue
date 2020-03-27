<!--
  This file is for the Add Event component.
  It calculates possible timeslots for an appointment, and handles the input data.
-->


<template>
  <div>
    <!-- The popup's headers -->
    <div class="headers">
      <h2 class="dialogue-header heading-2">Add Appointment</h2>
      <h3 class="dialogue-date heading-3">{{ getFormattedDate }}</h3>
    </div>

    <!-- Appointment Type Dropdown -->
    <div v-if="!!!appointmentType" class="segment">
      <h4 class="form-heading">Choose an appointment type:</h4>
      <select v-model="chosenAppointmentType" class="form-input select">
        <option v-for="type in appointmentTypes" :key="type._id" :value="type"
        >{{ type.name }} - {{ type.duration }} minutes
        </option
        >
      </select>
    </div>

    <!-- Start Time Input -->
    <div v-if="chosenAppointmentType.duration" class="segment">
      <h4 class="form-heading">Choose a time slot:</h4>
      <select v-model="chosenTime" class="form-input select">
        <option v-for="timeSlot in timeSlots" :value="timeSlot" :key="timeSlot.startTime.toString()">
          {{ getFormattedTimeSlot(timeSlot) }}
        </option>
      </select>
    </div>

    <!-- Recurring -->
    <div v-if="chosenAppointmentType._id && !!!appointmentType" class="segment recurring">
      <h4 class="form-heading">Is it recurring?</h4>
      <h4
          class="heading-4"
          :class="{ success: chosenAppointmentType.isRecurring, error: !chosenAppointmentType.isRecurring }"
      >
        {{ chosenAppointmentType.isRecurring ? "Yes" : "No" }}
      </h4>
      <h4 v-if="chosenAppointmentType.isRecurring" class="form-heading">
        {{ chosenAppointmentType.recurringDuration }} weeks.
      </h4>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage.length > 0" class="segment">
      <h4 class="heading-4 error">{{ errorMessage }}</h4>
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
        errorMessage: "", // Place to store the error message (if there is one)
        chosenTime: {}, // The appointment start time chosen by the user.
        timeSlots: [], // The timeslots avaiabable for the user to book.
        appointmentTypes: {}, // The available appointment types the user can choose from.
        chosenAppointmentType: {} // The appointment type chosen by the user.
      };
    },
    props: {
      day: {}, // The day the user clicked on.
      dayEvents: {}, // The already booked appointments happening on this day.
      businessHours: {}, // The hours the counsellor is working on this day.
      appointmentBufferTime: Number, // The minimum amount of time between each appointment.
      appointmentType: {} // The specified appointment type of the appointment (null if the user needs to choose an appointment).
    },
    computed: {
      // Get the days date in the format '30th Jan 2020'
      getFormattedDate() {
        return this.moment(this.day.start).format("Do MMM Y");
      }
    },
    beforeMount() {
      // Generate the possible timeslots before the content is mounted on the page.
      this.getPossibleTimeSlots();
    },
    async mounted() {
      // If an appointment type has been provided, set the chosen appointment type to be the specified appointment type.
      if (this.appointmentType) {
        this.chosenAppointmentType = this.appointmentType;
      } else {
        // Fetch all the appointment types
        this.appointmentTypes = (await AppointmentTypeService.getAppointmentTypes()).data.appointmentTypes;
      }
    },
    methods: {
      // Called when an appointment type and time has been chosen. Validates the data and emits the chosen type and time to the parent.
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

        // Emit an event to send the information back to BookAppointmentPage
        let appointmentStartTime = this.chosenTime.startTime;
        let appointmentType = this.chosenAppointmentType;
        this.$emit("date-chosen", {
          appointmentStartTime,
          appointmentType
        });
      },

      // Generate the possible time slots for the chosen appointment type.
      getPossibleTimeSlots() {
        // Make sure the data is valid.
        if (this.businessHours == null || this.businessHours.length > 0 || this.chosenAppointmentType.duration == null)
          return;

        // Get the start and end of the day as moment objects.
        let dayStart = Utils.getMomentFromTimeString(this.day.start, this.businessHours.startTime);
        let dayEnd = Utils.getMomentFromTimeString(this.day.start, this.businessHours.endTime);
        console.log(dayEnd.format('HHmm'));
        // Create a moment duration of the duration of the appointment type.
        let appointmentDuration = this.moment.duration(this.chosenAppointmentType.duration, "minutes");

        // Initialize empty timeSlots array
        let timeSlots = [];

        // Set last time slot to be the first time slot.
        let prevTimeSlot = {};
        prevTimeSlot.startTime = dayStart;
        prevTimeSlot.endTime = this.moment(dayStart).add(appointmentDuration);

        // You can only schedule 1 appointment per hour
        let oneHour = this.moment.duration(1, "hour");

        // until we've reached the end of the day
        while (!prevTimeSlot.endTime.isAfter(dayEnd)) {
          // console.log(prevTimeSlot.endTime.format('HHmm'));
          timeSlots.push(prevTimeSlot);

          // Calculate the next time slot
          let nextTimeSlot = {};
          nextTimeSlot.startTime = this.moment(prevTimeSlot.startTime).add(oneHour);
          nextTimeSlot.endTime = this.moment(nextTimeSlot.startTime).add(appointmentDuration);

          prevTimeSlot = nextTimeSlot;
        }

        // filter out disabled appointments.
        let filteredTimeSlots = this.filterTimeSlots(timeSlots);
        this.timeSlots = filteredTimeSlots;
      },

      // Filter out any already booked appointments.
      filterTimeSlots(timeSlots) {
        // create moment objects
        let bufferTime = this.appointmentBufferTime;

        // Get the times of the already booked appointments, but add the buffer time either side of the appointment.
        let bookedTimes = this.dayEvents.map(event => ({
          startTime: this.moment(event.start),
          endTime: this.moment(event.end).add(bufferTime, "minutes")
        }));

        // Filter the time slots to only include ones that don't clash with an already booked appointment.
        let filteredTimeSlots = timeSlots.filter(timeSlot => {
          // add the buffer time to the end of the appointment.
          timeSlot.endTime.add(bufferTime, "minutes");
          let conflictingAppointment = bookedTimes.find(bookedTime => {
            // check to see if there are conflicting appointments (returns true if there is a conflict)
            return (
                timeSlot.startTime.isBetween(
                    bookedTime.startTime,
                    bookedTime.endTime,
                    null, // Granularity: This could be set to 'day', 'week', 'year' etc, but isn't needed here.
                    // [ - Inclusion: return true if the time slot time slot start time is the same as the booked time start time.
                    // ) - Exclusion: return false if the time slot start time matches the booked time end time (this will be the end of the appointment buffer time).
                    "[)"
                ) || timeSlot.endTime.isBetween(bookedTime.startTime,
                    bookedTime.endTime,
                    null,
                    // ( - Exclusion: return false if the time slot end time matches the booked time start time.
                    // ] - Inclusion: return true if the time slot end time is the same as the booked time end time.
                    "(]")

                // NOTE: How I determined inclusion vs exclusion is explained in the evidence file, under Algorithms - Appointment Scheduling - Timeslot Generation - Appointment Overlap.
            );
          });
          // Remove the buffer time from the end of the appointment.
          timeSlot.endTime.subtract(bufferTime, "minutes");
          // Only include the timeslot if it doesn't clash with any other appointments.
          if (!conflictingAppointment) return true;
        });

        // return filtered time slots.
        return filteredTimeSlots;
      },

      // Format a timeslot to be easily readable. (09:00 - 17:00)
      getFormattedTimeSlot(timeSlot) {
        return timeSlot.startTime.format("HH:mm") + " - " + timeSlot.endTime.format("HH:mm");
      }
    },
    watch: {
      // Generate new time slots whenever the appointment type changes, as appointment types can have durations.
      chosenAppointmentType: function () {
        // work out new available time slots.
        this.getPossibleTimeSlots();
      }
    }
  };
</script>
