<template>
  <div class="reschedule-dialogue-content">
    <h2 class="heading-2">Reschedule Appointment</h2>
    <h4 class="heading-4">
      <span>Old Appointment Time:</span>
      {{getFullAppointmentTime(appointment.startTime, appointment.endTime)}}
    </h4>
    <h4 class="heading-4 new-time">
      <span>New Appointment Time:</span>
      {{newTime.startTime ? getFullAppointmentTime(newTime.startTime, newTime.endTime) : "No time selected"}}
    </h4>
    <appointment-calendar
      v-if="showCalendar"
      class="calendar"
      :counsellor="counsellor"
      userCanAddEvents
      @date-chosen="setNewTime"
      :clientAppointments="clientAppointments"
      :mandAppointmentType="appointment.appointmentType"
    ></appointment-calendar>
    <button
      v-else
      @click="showCalendar = true"
      class="btn btn-secondary choose-time-button"
    >Choose a new time</button>

    <h4 class="heading-4 error" :class="{'success' : 'message.success'}">{{message.content}}</h4>
    <button
      class="btn btn-primary reschedule-button"
      @click="rescheduleAppointment"
    >Reschedule Appointment</button>

    <p class="paragraph">This will not affect any other appointments.</p>
  </div>
</template>

<script>
import AppointmentService from "@/services/AppointmentService";
import UserService from "@/services/UserService";
export default {
  props: {
    appointment: Object
  },
  data() {
    return {
      message: {
        content: "",
        success: false
      },
      showCalendar: false,
      clientAppointments: [],
      counsellor: {},
      newTime: {
        startTime: null,
        endTime: null
      }
    };
  },
  components: {
    AppointmentCalendar: () =>
      import("@/components/misc/Calendar/AppointmentCalendar.vue")
  },
  computed: {},
  methods: {
    async rescheduleAppointment() {
      if (!this.newTime.startTime || !this.newTime.endTime) {
        this.message.content = "Please choose a new time for your appointment.";
        this.message.success = false;
        return;
      }

      let res;
      try {
        res = await AppointmentService.updateAppointment(
          {
            startTime: this.newTime.startTime.toString(),
            endTime: this.newTime.endTime.toString()
          },
          this.appointment._id
        );
      } catch (error) {
        console.log(error);
        res = error.response;
      }

      this.message.content = res.data.message;
      this.message.success = res.data.success;
    },

    setNewTime({ appointmentStartTime, appointmentType }) {
      this.newTime.startTime = appointmentStartTime;
      this.newTime.endTime = appointmentStartTime
        .clone()
        .add(appointmentType.duration, "minutes");
      this.showCalendar = false;
    },

    async getClientAppointments() {
      try {
        for (let client of this.appointment.clients) {
          let res = await AppointmentService.getAppointmentsOfUser({
            userId: client,
            reduced: true,
            params: {
              fromTime: this.moment()
                .startOf("week")
                .toString()
            }
          });
          this.clientAppointments = this.clientAppointments.concat(
            res.data.appointments
          );
        }
      } catch (error) {
        console.log(error);
      }
    },

    async getCounsellor() {
      try {
        let res = await UserService.getCounsellor(
          this.appointment.counsellorId
        );

        this.counsellor = res.data.counsellor;
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    },

    getFullAppointmentTime(start, end) {
      start = this.moment(start);
      end = this.moment(end);
      return `${start.format("HH:m")}-${end.format(
        "HH:mm"
      )}, ${start.clone().format("dddd Do MMMM")}`;
    }
  },
  async mounted() {
    await this.getClientAppointments();
    await this.getCounsellor();
  }
};
</script>

<style scoped lang="scss">
.reschedule-dialogue-content {
  text-align: left;
  width: 60vw;
  height: 80vh;
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