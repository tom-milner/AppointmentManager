<template>
  <full-calendar
    @dateClick="handleDateClick"
    :dayRender="dayRender"
    ref="fullCalendar"
    :weekends="false"
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
</template>

<script>
// calendar
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default {
  components: {
    FullCalendar
  },
  methods: {
    handleDateClick: function(arg) {
      console.log(arg);
    },
    dayRender: function() {
      // dayRenderInfo.el.bgColor = "red";
    }
  },
  props: {
    events: {}
  },

  mounted() {
    console.log(this.eventSources);
  },

  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      eventSources: [
        { events: this.events.userEvents },
        { events: this.events.counsellorEvents }
      ]
    };
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