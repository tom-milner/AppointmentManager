<!--
    This component is for rescheduling an appointment. It lets the user choose a new appointment time using the appointment calendar,
    and requests an appointment reschedule to the API.
-->

<template>
  <div class="reschedule-dialogue-content">
    <h2 class="heading-2">Reschedule Appointment</h2>
    <h4 class="heading-4">
      <span>Old Appointment Time:</span>
      {{ getFullAppointmentTime(appointment.startTime, appointment.endTime) }}
    </h4>
    <h4 class="heading-4 new-time">
      <span>New Appointment Time:</span>
      {{ newTime.startTime ? getFullAppointmentTime(newTime.startTime, newTime.endTime) : "No time selected" }}
    </h4>
    <appointment-calendar
        v-if="showCalendar"
        class="calendar"
        :counsellor="counsellor"
        userCanAddEvents
        @date-chosen="setNewTime"
        :clientAppointments="clientAppointments"
        :mandAppointmentType="appointment.appointmentType"
    />
    <button v-else @click="showCalendar = true" class="btn btn-secondary choose-time-button">Choose a new time</button>

    <h4 class="heading-4 error" :class="{ success: message.success }">{{ message.content }}</h4>
    <button class="btn btn-primary reschedule-button" @click="rescheduleAppointment">Reschedule Appointment</button>

    <p class="paragraph">This will not affect any other appointments.</p>
  </div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
export default {
  props: {
    appointment: Object // The appointment to be rescheduled.
  },
  data() {
    return {
      message: {
        // The error/success message to show.
        content: "",
        success: false
      },
      showCalendar: false, // Whether to show the calendar or not.
      clientAppointments: [], // The client's appointments.
      counsellor: {}, // The counsellor of the appointment.
      newTime: {
        // The new times of the appointment.
        startTime: null,
        endTime: null
      }
    };
  },
  components: {
    // Import the appointment calendar component asynchronously to avoid an import loop.
    AppointmentCalendar: () => import("@/components/misc/Calendar/AppointmentCalendar.vue")
  },
  methods: {
    // Reschedule the appointment.
    async rescheduleAppointment() {
      // Validate the data.
      if (!this.newTime.startTime || !this.newTime.endTime) {
        this.message.content = "Please choose a new time for your appointment.";
        this.message.success = false;
        return;
      }

      // Try to update the appointment.
      let res;
      try {
        // Send the 'update appointment request'
        res = await AppointmentService.updateAppointment(
          {
            startTime: this.newTime.startTime.toDate(),
            endTime: this.newTime.endTime.toDate()
          },
          this.appointment._id
        );
      } catch (error) {
        res = error.response;
      }

      this.message.content = res.data.message;
      this.message.success = res.data.success;

      // If the appointment was updated successfuly we can close the reschedule view.
      if (res.data.success) this.$parent.$emit("close-dialogue");
    },

    // Set the new selected time, and hide the appointment calendar.
    setNewTime({ appointmentStartTime, appointmentType }) {
      this.newTime.startTime = appointmentStartTime;
      this.newTime.endTime = appointmentStartTime.clone().add(appointmentType.duration, "minutes");
      this.showCalendar = false;
    },

    // Get the appointments of all the clients of the appointment.
    async getClientAppointments() {
      try {
        // Go through each client.
        for (let client of this.appointment.clients) {
          // Get the client's appointments.
          let res = await AppointmentService.getAppointmentsOfUser({
            userId: client,
            reduced: true,
            params: {
              // Only get appointments from the start of the week.
              fromTime: this.moment()
                .startOf("week")
                .toString()
            }
          });

          // Add the appointments of the clients to the list of all client appointments.
          this.clientAppointments = this.clientAppointments.concat(res.data.appointments);
        }
      } catch (error) {
        // Display the error messages.
        this.message.contents = error.response.message;
        this.message.success = error.response.success;
      }
    },

    // Get the counsellor of the appointment.
    async getCounsellor() {
      // Get the counsellor
      try {
        let res = await UserService.getReducedCounsellor(this.appointment.counsellorId);

        this.counsellor = res.data.counsellor;
      } catch (error) {
        this.message.contents = error.response.message;
        this.message.success = error.response.success;
      }
    },

    // Get an appointment time in the format '07:00-07:50, Tuesday 28th January'.
    getFullAppointmentTime(start, end) {
      start = this.moment(start);
      end = this.moment(end);
      return `${start.format("HH:mm")}-${end.format("HH:mm")}, ${start.clone().format("dddd Do MMMM")}`;
    }
  },
  async mounted() {
    // Get the client appointments and the counsellor information.
    await this.getClientAppointments();
    await this.getCounsellor();
  }
};
</script>

<style scoped lang="scss">
.reschedule-dialogue-content {
  text-align: left;
  width: 70vw;
  height: 85vh;
  padding: 1rem;
  overflow-y: scroll;
  & > *:not(:last-child) {
    margin-bottom: 2rem;
  }

  h4 {
    span {
      font-weight: 500;
      display: inline-block;
      width: 22rem;
    }
    vertical-align: middle;
    &.new-time {
      display: inline-block;
    }
  }

  .calendar {
    margin-top: 2rem;
  }

  .choose-time-button {
    vertical-align: middle;
    margin-left: 2rem;
    display: inline-block;
  }

  .reschedule-button {
    margin-top: 2rem;
    display: block;
  }
}
</style>
