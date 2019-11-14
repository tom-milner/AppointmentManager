<template>
  <div>
    <!-- Customised Calendar -->
    <full-calendar
      @select="handleDateClick"
      @eventClick="handleEventClick"
      ref="fullCalendar"
      defaultView="timeGridWeek"
      :weekends="true"
      :header="{
        left: 'prev,next, today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }"
      :plugins="calendarPlugins"
      :eventSources="[
        { events: getClientEvents},
        { events: getCounsellorEvents },
      ]"
      :businessHours="businessHours"
      :selectConstraint="businessHours"
      :selectable="userCanAddEvents"
    ></full-calendar>

    <!-- Add Event Popup -->
    <div v-if="userCanAddEvents">
      <CalendarPopup
        v-if="showAddEventPopup"
        :spaceClicked="screenToAvoid"
        v-on:close-popup="toggleAddEventPopup"
      >
        <!-- Add Event Form -->
        <AddEvent
          :day="chosenDay"
          :dayEvents="getEventsOfChosenDay"
          :businessHours="getBusinessHoursOfDay"
          :appointmentBufferTime="counsellor.appointmentBufferTime"
          v-on:date-chosen="dateChosen"
        ></AddEvent>
      </CalendarPopup>
    </div>

    <!-- Modal -->
    <ViewAppointment
      :appointment="selectedAppointment"
      isUserCounsellor
      v-if="viewAppointmentModalDisplayed"
      v-on:close-modal="viewAppointmentModalDisplayed = false; updateEvents()"
    ></ViewAppointment>
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
import CalendarPopup from "./CalendarPopup";
import ViewAppointment from "@/components/misc/ViewAppointment";

import AppointmentService from "@/services/AppointmentService";
import Utils from "@/utils";

export default {
  data() {
    return {
      calendarPlugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      showAddEventPopup: false,
      showViewEventPopup: false,
      screenToAvoid: {},
      chosenDay: {},
      businessHours: [],
      viewAppointmentModalDisplayed: false,

      // events to display in the calendar.
      events: {
        clientEvents: [],
        counsellorEvents: []
      }
    };
  },
  props: {
    clientAppointments: Array,
    counsellor: Object,
    // whether the user can add events or not.
    userCanAddEvents: Boolean,
    allowViewEvents: Boolean
  },

  components: {
    FullCalendar,
    AddEvent,
    CalendarPopup,
    ViewAppointment
  },

  computed: {
    getCounsellorEvents() {
      return this.events.counsellorEvents;
    },

    getClientEvents() {
      return this.events.clientEvents;
    },

    // This function returns all the events in an event source that are on a day.
    getEventsOfChosenDay() {
      // merge both the counsellor and user events into a single array.
      let allEvents = this.getCounsellorEvents.concat(this.getClientEvents);
      // create moment object from the day chosen
      let chosenDayTime = this.moment(this.chosenDay.start);
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
    },

    getBusinessHoursOfDay() {
      // the number of the day chosen in the week (0: Sunday, 6: Saturday)
      let chosenDay = this.moment(this.chosenDay.start).day();

      // Find the businessHours object of the day clicked.
      return this.businessHours.find(day => {
        return day.daysOfWeek[0] == chosenDay;
      });
    }
  },

  // TODO: add temporary event to show user (color it green(?) to show its temporary)
  methods: {
    updateEvents() {
      this.$emit("update-events");
    },
    mapAppointmentsToEvents(appointments) {
      if (appointments.length > 0) {
        return appointments.map(appointment => ({
          title: appointment.title,
          end: appointment.endTime,
          start: appointment.startTime,
          id: appointment._id,
          backgroundColor: appointment.appointmentType.color
        }));
      }
      return [];
    },

    // function to run when a user selects a day.
    dateChosen({ appointmentStartTime, appointmentType }) {
      // add date to appointment start time
      this.$emit("date-chosen", {
        appointmentStartTime,
        appointmentType
      });
      this.$emit("close-modal");
    },

    // triggered when an event is clicked
    handleEventClick(event) {
      if (this.userCanAddEvents) return;
      this.viewAppointmentModalDisplayed = true;
      this.selectedAppointment = this.clientAppointments.find(
        appointment => event.event.id == appointment._id
      );
    },

    // triggered when user clicks on a day
    handleDateClick: function(day) {
      // store the day clicked
      this.chosenDay = day;
      if (day.view.type == "dayGridMonth") {
        // get screen coordinates of day clicked
        this.screenToAvoid = day.dayEl.getBoundingClientRect();
        // toggle the add event popup.
      }
      if (day.view.type == "timeGridWeek") {
        // for this view, just move the modal out of the way of the mouse.
        // let mouseX = day.jsEvent.clientX;
        // let mouseY = day.jsEvent.clientY;

        this.screenToAvoid = day.jsEvent.srcElement.getBoundingClientRect();
      }
      this.toggleAddEventPopup();
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
    removeDuplicateEvents: function() {
      let clientEvents = this.getClientEvents;
      let counsellorEvents = this.getCounsellorEvents;
      if (counsellorEvents) {
        // filter counsellorEvents, only including events that don't match the start or end time of a user event.
        this.events.counsellorEvents = counsellorEvents.filter(function(
          counsellorEvent
        ) {
          // see if clientEvents contains the current counsellor event, and find it's index.
          let dup = clientEvents.find(
            userEvent =>
              userEvent.start == counsellorEvent.start ||
              userEvent.end == counsellorEvent.end
          );
          return !dup;
        });
      }
    },
    createBusinessHours() {
      this.businessHours = this.counsellor.workingDays.map(day => {
        // return start, end and title
        let dayNumber = Utils.getNumberOfDayInWeek(day.name);
        return {
          startTime: day.startTime,
          endTime: day.endTime,
          daysOfWeek: [dayNumber]
        };
      });
    }
  },
  async mounted() {
    // get counsellor appointments
    if (this.counsellor) {
      let counsellorAppointments = (await AppointmentService.getAppointmentsOfUser(
        {
          userId: this.counsellor._id,
          isCounsellor: true,
          reduced: true,
          params: {
            fromTime: this.moment()
              .startOf("week")
              .toString()
          }
        }
      )).data.appointments;

      this.createBusinessHours();
      this.events.counsellorEvents = this.mapAppointmentsToEvents(
        counsellorAppointments
      );
    }

    this.events.clientEvents = this.mapAppointmentsToEvents(
      this.clientAppointments
    );

    this.removeDuplicateEvents();
  },
  watch: {
    clientAppointments(apps) {
      this.events.clientEvents = this.mapAppointmentsToEvents(apps);
    },
    events() {
      //   this.removeDuplicateEvents();
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
</style>