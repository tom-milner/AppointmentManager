<template>
  <div>
    <full-calendar
      @dateClick="handleDateClick"
      :dayRender="dayRender"
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
    <AddEventDialogue
      v-on:close-dialogue="toggleShowAddEventDialogue"
      v-if="showAddEventDialogue"
      :dayRectangle="chosenDayRectangle"
    ></AddEventDialogue>
  </div>
</template>

<script>
// calendar
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// custom components
import AddEventDialogue from "./AddEventDialogue";

export default {
  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      showAddEventDialogue: false,
      chosenDayRectangle: {}
    };
  },
  components: {
    FullCalendar,
    AddEventDialogue
  },
  methods: {
    handleDateClick: function(day) {
      // trigger new appointment dialogue
      // get screen coordinates of day clicked
      let dayElement = day.dayEl;
      this.chosenDayRectangle = dayElement.getBoundingClientRect();
      if (!this.showAddEventDialogue) {
        this.toggleShowAddEventDialogue();
      }
    },
    toggleShowAddEventDialogue() {
      this.showAddEventDialogue = !this.showAddEventDialogue;
    },
    dayRender: function() {
      // dayRenderInfo.el.bgColor = "red";
    },
    checkEventSourcesForDuplicates: function() {
      console.log("checking");
      // remove all duplicate start events from counsellor events array
      let userEvents = this.events.userEvents;
      let counsellorEvents = this.events.counsellorEvents;

      counsellorEvents = counsellorEvents.filter(function(event) {
        return (
          userEvents.findIndex(
            ev => ev.start == event.start && ev.end == event.end
          ) == -1
        );
      });

      this.events.counsellorEvents = counsellorEvents;
    }
  },
  props: {
    events: {}
  },

  watch: {
    events: function() {
      if (
        this.events.counsellorEvents.length > 0 ||
        this.events.userEvents.length > 0
      ) {
        console.log("going to check");
        this.checkEventSourcesForDuplicates();
      }
    }
  },
  // check for duplicate events before mounting
  beforeMount() {
    this.checkEventSourcesForDuplicates();
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

// have to use !important to override component css

.fc {
  font-family: $font-family !important;
  tr {
    height: 2rem !important;

    td {
      font-size: 1.5rem;

      .fc-axis {
        width: 5rem !important;
      }
    }
  }
  &-event {
    font-size: 1.4rem !important ;
  }
  &-toolbar h2 {
    font-size: 3rem !important;
    font-weight: 300 !important;
  }

  &-day-number {
    font-size: 1.5rem;
  }

  &-button {
    text-transform: uppercase;
    font-weight: 200;
    color: $color-white;
  }

  &-widget-header {
    font-size: 1.5rem;
    font-weight: 300;
    color: $color-primary-dark;
  }
}
</style>