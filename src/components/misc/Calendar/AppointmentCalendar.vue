<template>
  <div>
    <!-- Calendar -->
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
        { events: this.events.counsellorEvents, className:'counsellorEvent' }
      ]"
    ></full-calendar>

    <!-- Add Event Popup -->
    <div v-if="isEditable">
      <CalendarPopup
        v-if="showAddEventPopup"
        :spaceClicked="chosenDayRectangle"
        v-on:close-popup="toggleShowAddEventPopup"
      >
        <!-- <AddEventDialogue
          :day="chosenDay"
          :dayEvents="getEventsOfChosenDay"
          v-on:date-chosen="dateChosen"
        ></AddEventDialogue>-->

        <h2>This works</h2>
      </CalendarPopup>
    </div>

    <!-- View Event Popup -->
    <CalendarPopup
      v-if="showEventPopup"
      @close-popup="toggleEventPopup"
      :spaceClicked="chosenEventRectangle"
    >
      <h1>It works</h1>
    </CalendarPopup>
  </div>
</template>

<script>
// calendar
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// custom components
import AddEventDialogue from "../../pages/CreateAppointmentPage/AppointmentCalendar/AddEventDialogue.vue";
import CalendarPopup from "../../misc/Calendar/CalendarPopup";
export default {
  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      showAddEventPopup: false,
      showEventPopup: false,
      chosenDayRectangle: {},
      chosenEventRectangle: {}
    };
  },
  components: {
    FullCalendar,
    AddEventDialogue,
    CalendarPopup
  },

  computed: {
    getEventsOfChosenDay() {
      let allEvents = this.events.userEvents.concat(
        this.events.counsellorEvents
      );
      let chosenDayTime = this.moment(this.chosenDay.date);
      let dayEvents = allEvents.filter(event => {
        // check to see if event is on the same day
        return (
          chosenDayTime.isSame(event.start, "day") ||
          chosenDayTime.isSame(event.end, "day")
        );
      });
      return dayEvents;
    }
  },

  // TODO: add temporary event to show user (color it green or something to show its temporary)
  methods: {
    dateChosen({ appointmentStartTime, appointmentDuration }) {
      // add date to appointment start time
      console.log(appointmentStartTime);
      console.log(this.chosenDay);
      appointmentStartTime = this.$emit("date-chosen", {
        appointmentStartTime,
        appointmentDuration
      });
      this.$emit("close-modal");
    },

    // triggered when an event is clicked
    handleEventClick(event) {
      this.chosenEventRectangle = event.el.getBoundingClientRect();
      this.showEventPopup = !this.showEventPopup;
    },

    handleDateClick: function(day) {
      // trigger new appointment popup
      // get screen coordinates of day clicked
      this.chosenDayRectangle = day.el.getBoundingClientRect();
      this.showAddEventPopup = !this.showAddEventPopup;
    },

    // show or hide the add event popup
    toggleShowAddEventPopup() {
      this.showAddEventPopup = !this.showAddEventPopup;
    },

    // show or hide the event popup
    toggleEventPopup() {
      this.showEventPopup = !this.showEventPopup;
    },

    removeDuplicateEventsForDuplicates: function() {
      // remove all duplicate start events from counsellor events array
      let userEvents = this.events.userEvents;
      let counsellorEvents = this.events.counsellorEvents;
      console.log("checking");

      if (counsellorEvents) {
        counsellorEvents = counsellorEvents.filter(function(counsellorEvent) {
          console.log(counsellorEvent);
          let index = userEvents.findIndex(
            userEvent =>
              userEvent.start == counsellorEvent.start ||
              userEvent.end == counsellorEvent.end
          );
          return index == -1;
        });

        this.events.counsellorEvents = counsellorEvents;
      }
    }
  },
  props: {
    events: {},
    isEditable: Boolean
  },

  watch: {
    events: function() {
      if (
        this.events.counsellorEvents.length > 0 ||
        this.events.userEvents.length > 0
      ) {
        this.removeDuplicateEventsForDuplicates();
      }
    }
  },
  // remove duplicate events before mounting
  beforeMount() {
    this.removeDuplicateEventsForDuplicates();
  }
};
</script>

<style lang="scss" >
@import "src/scss/global";
// calendar css
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";

.userEvent {
  background-color: $color-primary !important;
  outline: none;
  border: none;
  padding: 0.2rem;
}

.counsellorEvent {
  background-color: $color-grey !important;
  outline: none;
  border: none;
  padding: 0.2rem;
}
</style>