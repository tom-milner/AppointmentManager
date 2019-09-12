<template>
  <div>
    <!-- Customised Calendar -->
    <full-calendar
      @dateClick="handleDateClick"
      @eventClick="handleEventClick"
      ref="fullCalendar"
      :weekends="true"
      :header="{
        left: 'prev,next, today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }"
      :plugins="calendarPlugins"
      :eventSources="[
        { events: this.events.userEvents, className:'userEvent' },
        { events: this.events.counsellorEvents, className:'counsellorEvent' },
      ]"
      :businessHours="businessHours"
      :selectConstraint="businessHours"
      :selectable="userCanAddEvents"
    ></full-calendar>

    <!-- Add Event Popup -->
    <div v-if="userCanAddEvents">
      <CalendarPopup
        v-if="showAddEventPopup"
        :spaceClicked="chosenDayRectangle"
        v-on:close-popup="toggleAddEventPopup"
      >
        <!-- Add Event Form -->
        <AddEvent :day="chosenDay" :dayEvents="getEventsOfChosenDay" v-on:date-chosen="dateChosen"></AddEvent>
      </CalendarPopup>
    </div>

    <!-- View Event Popup -->
    <CalendarPopup
      v-if="showViewEventPopup"
      @close-popup="toggleViewEventPopup"
      :spaceClicked="chosenEventRectangle"
    >
      <!-- View Event Component -->
      <ViewEvent />
    </CalendarPopup>
  </div>
</template>

<script>
// Calendar Imports
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// custom components
import AddEvent from "./AddEvent.vue";
import ViewEvent from "./ViewEvent.vue";
import CalendarPopup from "./CalendarPopup";

export default {
  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      showAddEventPopup: false,
      showViewEventPopup: false,
      chosenDayRectangle: {},
      chosenDay: {},
      chosenEventRectangle: {},
      businessHours: []
    };
  },
  props: {
    // events to display in the calendar.
    events: {},
    // whether the user can add events or not.
    userCanAddEvents: Boolean
  },

  components: {
    FullCalendar,
    AddEvent,
    ViewEvent,
    CalendarPopup
  },

  beforeMount() {
    this.businessHours = this.events.disabledEvents;
    console.log(this.businessHours);
  },

  computed: {
    // This function returns all the events in an event source that are on a day.
    getEventsOfChosenDay() {
      // merge both the counsellor and user events into a single array.
      let allEvents = this.events.userEvents.concat(
        this.events.counsellorEvents
      );
      // create moment object from the day chosen
      let chosenDayTime = this.moment(this.chosenDay.date);

      // Filter all the events, excluding any events that don't have a start or end time that falls on the same day.
      let dayEvents = allEvents.filter(event => {
        // check to see if event is on the same day
        return (
          chosenDayTime.isSame(event.start, "day") ||
          chosenDayTime.isSame(event.end, "day")
        );
      });

      // return all the events of that given day.
      return dayEvents;
    }
  },

  // TODO: add temporary event to show user (color it green or something to show its temporary)
  methods: {
    // function to run when a user selects a day.
    dateChosen({ appointmentStartTime, appointmentDuration }) {
      // add date to appointment start time
      this.$emit("date-chosen", {
        appointmentStartTime,
        appointmentDuration
      });
      this.$emit("close-modal");
    },

    // triggered when an event is clicked
    handleEventClick(event) {
      // set the rectangle of screen that the event resides in.
      this.chosenEventRectangle = event.el.getBoundingClientRect();
      // toggle the event popup
      this.toggleViewEventPopup();
    },

    // triggered when user clicks on a day
    handleDateClick: function(day) {
      console.log(day.view.type);
      console.log(day);
      if (day.view.type == "dayGridMonth") {
        // store the day clicked
        this.chosenDay = day;
        // get screen coordinates of day clicked
        this.chosenDayRectangle = day.dayEl.getBoundingClientRect();
        // toggle the add event popup.
        this.toggleAddEventPopup();
      }
    },

    // show or hide the add event popup
    toggleAddEventPopup() {
      this.showAddEventPopup = !this.showAddEventPopup;
    },

    // show or hide the event popup
    toggleViewEventPopup() {
      this.showViewEventPopup = !this.showViewEventPopup;
    },

    // This function removes any duplicate events in the counsellor events array (where the counsellor will be counselling the current user)
    removeDuplicateEventsForDuplicates: function() {
      let userEvents = this.events.userEvents;
      let counsellorEvents = this.events.counsellorEvents;

      if (counsellorEvents) {
        // filter counsellorEvents, only including events that don't match the start or end time of a user event.
        counsellorEvents = counsellorEvents.filter(function(counsellorEvent) {
          // see if userEvents contains the current counsellor event, and find it's index.
          let index = userEvents.findIndex(
            userEvent =>
              userEvent.start == counsellorEvent.start ||
              userEvent.end == counsellorEvent.end
          );

          // if the index is -1, counsellorEvent is not in userEvents. Therefore it can stay in counsellor events.
          return index == -1;
        });
        // save the filtered counsellorEvents
        this.events.counsellorEvents = counsellorEvents;
      }
    }
  },

  watch: {
    // function watches for changes to the events prop, and removes duplicates.
    events: function() {
      if (
        this.events.counsellorEvents.length > 0 ||
        this.events.userEvents.length > 0
      ) {
        this.removeDuplicateEventsForDuplicates();
      }
    }
  }
};
</script>

<style lang="scss" >
// global styles
@import "src/scss/global";

// calendar css
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";

// custom css to override deafult calendar styling.
@import "src/scss/components/calendar";

// Event from user
.userEvent {
  background-color: $color-primary !important;
  outline: none;
  border: none;
  padding: 0.2rem;
}

// Event from calendar
.counsellorEvent {
  background-color: $color-grey !important;
  outline: none;
  border: none;
  padding: 0.2rem;
}
</style>