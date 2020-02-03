<template>
  <div class="wrapper">
    <!-- Work Day Settings -->
    <h2 class="heading-2">Appointment Settings</h2>
    <!-- Appointment Types -->
    <div class="container">
      <h3 class="heading-3">Appointment Types</h3>
      <p class="paragraph note">
        <span>Note:</span> the buffer time (specified below) is automatically added between appointments.
      </p>
      <ul class="appointment-type-list">
        <li class="list-item" v-for="type in appointmentTypes" :key="type._id">
          <AppointmentTypeContainer
            userCanEdit
            @refresh-appointments="getAppointmentTypes"
            :type="type"
            :forceOpen="!!!type.name"
          />
        </li>
        <li class="list-item" v-if="!addingNewAppointmentType">
          <button @click="addNewAppointmentType" class="btn btn-secondary">Add New</button>
        </li>
      </ul>
    </div>

    <div class="container buffer-time">
      <h3 class="heading-3">Appointment Buffer Time</h3>
      <p class="paragraph note">This is the minimum time inbetween appointments.</p>
      <form v-on:submit.prevent="updateBufferTime">
        <h4 class="heading-4">Buffer Time:</h4>
        <input type="number" v-model="counsellor.appointmentBufferTime" class="form-input" max="30" min="10" />
        <h4 class="heading-4">mins</h4>
        <button class="btn btn-primary">Save</button>
      </form>
    </div>

    <h4 class="heading-4 error" :class="{ success: message.success }">{{ message.content }}</h4>
  </div>
</template>

<script>
import AppointmentTypeService from "@/services/AppointmentTypeService";
import AppointmentTypeContainer from "../../misc/AppointmentTypeContainer";
import UserService from "@/services/UserService";

export default {
  components: {
    AppointmentTypeContainer
  },
  data() {
    return {
      appointmentTypes: [], // All the appoinment types.
      counsellor: {}, // The current counsellor.
      message: {
        // The response error/success message and status.
        content: "",
        success: false
      }
    };
  },
  computed: {
    // Whether the counsellor is in the process of adding a new appointment type or not.
    addingNewAppointmentType() {
      // The last appointment in the appointment types list doesn't have an ID, the counsellor is adding a new appointment type.
      if (this.appointmentTypes.length > 0) return !this.appointmentTypes[this.appointmentTypes.length - 1]._id;
      return false;
    }
  },
  methods: {
    // Set the message.
    setMessage(message, success) {
      this.message.content = message;
      this.message.success = success;
    },

    //  Update the appointment buffer time.
    async updateBufferTime() {
      let res;
      try {
        res = await UserService.updateUser(
          this.counsellor._id,
          {
            appointmentBufferTime: this.counsellor.appointmentBufferTime
          },
          true // The user is a counsellor.
        );
      } catch (error) {
        res = error.response;
      }
      this.setMessage(res.data.message, res.data.success);
    },

    // Add a new appointment type to the list.
    addNewAppointmentType() {
      if (!this.addingNewAppointmentType)
        // If we're not already adding to the appointment type.
        this.appointmentTypes.push({
          name: "",
          description: "",
          duration: 0,
          isRecurring: false,
          color: ""
        });
    },

    // Get all the appointment types.
    async getAppointmentTypes() {
      try {
        let res = await AppointmentTypeService.getAppointmentTypes();
        this.appointmentTypes = res.data.appointmentTypes;
      } catch (error) {
        this.setMessage(error.response.data.message, error.response.data.success);
      }
    }
  },
  async mounted() {
    // Get the counsellor info.
    this.counsellor = this.$store.state.authentication.user;

    this.getAppointmentTypes();
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global.scss";

.container {
  margin-top: 5rem;
  .appointment-type-list {
    list-style: none;
    margin-top: 1rem;
    .list-item {
      padding: 0.75rem 0;

      button {
        width: 10%;
      }
    }
  }

  &.buffer-time {
    input {
      margin-top: 1rem;
      width: 6rem;
      font-size: 2rem;
      font-weight: 300;
      margin-right: 0.2rem;
    }
    h4 {
      display: inline-block;
      margin-right: 2rem;
    }
  }
}
.error {
  margin-top: 2rem;
}
</style>
