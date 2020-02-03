<template>
  <!-- Modal -->
  <Modal canPrint v-on:close-modal="$emit('close-modal')">
    <div class="wrapper">
      <!-- title -->
      <h2 class="heading-2">{{ appointment.title }}</h2>

      <!-- Counsellor  -->
      <ul class="appointment-details">
        <li class="appointment-details-row">
          <icon class="icon" name="user"></icon>
          <h4 class="heading-4">{{ counsellor.firstname }} {{ counsellor.lastname }}</h4>
        </li>

        <!-- Clients -->
        <li class="appointment-details-row">
          <icon class="icon" name="users"></icon>
          <h4 class="heading-4">{{ getFormattedClients }}</h4>
        </li>

        <!-- Start Time -->
        <li class="appointment-details-row">
          <icon class="icon" name="clock"></icon>
          <h4 class="heading-4">
            {{ getFormattedTime(appointment.startTime) }} - {{ getFormattedTime(appointment.endTime) }}
          </h4>
        </li>

        <!-- Date -->
        <li class="appointment-details-row">
          <icon class="icon" name="calendar"></icon>
          <h4 class="heading-4">{{ getFormattedDate }}</h4>
        </li>

        <!-- No. of appointment in recurring series -->
        <li v-if="appointment.appointmentType.isRecurring" class="appointment-details-row">
          <icon class="icon" name="refresh-ccw"></icon>
          <h4 class="heading-4">
            {{ appointment.recurringNo + 1 }} / {{ appointment.appointmentType.recurringDuration }} appointments
          </h4>
        </li>

        <!-- Appointment Approval Status -->
        <li class="appointment-details-row">
          <icon class="icon" name="check"></icon>
          <h4 class="heading-4" :class="getApprovalColor">{{ getApprovalStatus }}</h4>
        </li>

        <!-- Appointment Type -->
        <li class="section">
          <h4 class="heading-4">Appointment Type</h4>
          <AppointmentTypeContainer class="type" :type="appointment.appointmentType"></AppointmentTypeContainer>
        </li>

        <!-- Cient Notes -->
        <li class="section notes">
          <h4 class="heading-4">Client Notes (for counsellor to see) :</h4>
          <textarea :disabled="isCounsellor" class="form-input" v-model="appointment.clientNotes"></textarea>
          <button @click="saveNotes(false)" v-if="!isCounsellor" class="save btn btn-secondary">Save</button>
        </li>

        <!-- Counsellor Notes -->
        <li v-if="isCounsellor" class="section notes">
          <h4 class="heading-4">(private) Counsellor Notes:</h4>
          <textarea :disabled="!isCounsellor" class="form-input" v-model="appointment.counsellorNotes"></textarea>
          <button @click="saveNotes(true)" v-if="isCounsellor" class="save btn btn-secondary">Save</button>
        </li>

        <!-- Client Attendence Buttons -->
        <li class="section attendance">
          <h4 class="heading-4">Can client attend?</h4>
          <button
            @click="toggleClientAttendance()"
            class="btn checked"
            :class="{
              'btn-approved': appointment.clientCanAttend,
              'btn-disapproved': !appointment.clientCanAttend
            }"
          >
            {{ appointment.clientCanAttend ? "Yes" : "No" }}
          </button>
        </li>

        <!-- Counsellor Approval Buttons -->
        <li v-if="isCounsellor" class="section attendance">
          <h4 class="heading-4">Appointment approval:</h4>
          <button
            @click="toggleCounsellorApproval(true)"
            class="btn checked"
            :class="{ 'btn-approved': appointment.isApproved, 'btn-disapproved': !appointment.isApproved }"
          >
            {{ appointment.isApproved ? "Approved" : "Not Approved" }}
          </button>
        </li>

        <!-- Reschedule Button -->
        <li class="section reschedule">
          <button class="btn btn-secondary" @click="showRescheduleDialogue = !showRescheduleDialogue">
            Reschedule Appointment
          </button>
        </li>

        <!-- Delete Button -->
        <li v-if="isCounsellor" class="section delete">
          <h4 class="heading-4 error" :class="{ success: message.success }">{{ message.content }}</h4>
          <button @click="showDeleteDialogue = true" class="btn btn-disapproved">Delete Appointment</button>
        </li>
      </ul>

      <!-- Reschedule Appointment Dialogue -->
      <Dialogue @close-dialogue="showRescheduleDialogue = false" v-if="showRescheduleDialogue">
        <RescheduleView :appointment="appointment"></RescheduleView>
      </Dialogue>

      <!-- Delete Appointment Dialogue -->
      <Dialogue @close-dialogue="showDeleteDialogue = false" v-if="showDeleteDialogue">
        <div class="delete-dialogue-content">
          <h4 class="heading-4">Do you want to delete this appointment?</h4>
          <h4 class="heading-4">
            <span v-if="appointment.appointmentType.isRecurring"
              >You can either delete just this appointment or all it's recurring appointments.</span
            >
          </h4>
          <div class="dialogue-buttons">
            <button class="btn btn-disapproved" @click="deleteAppointment(false)">Delete Single Appointment</button>
            <button
              class="btn btn-disapproved"
              v-if="appointment.appointmentType.isRecurring"
              @click="deleteAppointment(true)"
            >
              Delete All Recurring Appointments
            </button>
            <button class="btn btn-approved" @click="showDeleteDialogue = false">Cancel</button>
          </div>
        </div>
      </Dialogue>
    </div>
  </Modal>
</template>

<script>
import UserService from "@/services/UserService";
import AppointmentService from "@/services/AppointmentService";
import AppointmentTypeContainer from "@/components/misc/AppointmentTypeContainer";
import Dialogue from "@/components/layout/DialogueBox";
import Modal from "@/components/layout/Modal";
import RescheduleView from "./RescheduleView";

export default {
  props: {
    appointment: {},
    isCounsellor: Boolean
  },
  computed: {
    // Get the date formatted as 'September 4, 1986'
    getFormattedDate: function() {
      return this.moment(this.appointment.startTime).format("LL");
    },

    // Get the approval status of an appointment (Approved/Pending)
    getApprovalStatus: function() {
      return this.appointment.isApproved ? "Approved" : "Pending";
    },

    // Get the CSS class for the color of the appointment status.
    getApprovalColor: function() {
      return this.appointment.isApproved ? "approved" : "pending";
    },

    // Get the clients as a single string, seperated by commas. (Tom Milner, Sam Mearns)
    getFormattedClients() {
      return this.clients.reduce(
        (acc, client, index) =>
          (acc += `${client.firstname} ${client.lastname}${!index == this.clients.length - 1 ? ", " : ""}`),
        ""
      );
    }
  },
  data() {
    return {
      clients: [], // The clients of the appointment.
      counsellor: {}, // The counsellor of the appointment.
      showDeleteDialogue: false, // Whether to show the delete dialogue or not.
      showRescheduleDialogue: false, // Whether to show the reschedule dialogue or not.
      message: {
        content: "", // The  message contents.
        success: false // Whether the action succeeded or not.
      }
    };
  },
  components: {
    AppointmentTypeContainer,
    Dialogue,
    Modal,
    RescheduleView
  },
  mounted() {
    // Get the client and counsellors names as soon as the component loads.
    this.getClientsNames();
    this.getCounsellorName();
  },
  methods: {
    // Delete the appointment.
    async deleteAppointment(deleteRecurring) {
      // send delete request
      let res;
      try {
        res = await AppointmentService.deleteAppointment(this.appointment._id, deleteRecurring);

        // Hide the delete dialogue.
        this.showDeleteDialogue = false;
        this.$emit("close-modal"); // Close the modal.
      } catch (error) {
        res = error.response.console.log(error);
      }
      this.setMessage(res.data.message, res.data.success);
    },

    // Format time as '8:30 PM'
    getFormattedTime: function(time) {
      return this.moment(time).format("LT");
    },

    // Change the client attendance.
    async toggleClientAttendance() {
      this.appointment.clientCanAttend = !this.appointment.clientCanAttend;
      let appointmentId = this.appointment._id;
      let res;
      try {
        // Update the appointment.
        res = await AppointmentService.updateAppointment(
          {
            clientCanAttend: this.appointment.clientCanAttend
          },
          appointmentId
        );
      } catch (error) {
        res = error.response;
      }
      this.setMessage(res.data.message, res.data.success);
    },

    // Change the counsellor approval status.
    async toggleCounsellorApproval() {
      this.appointment.isApproved = !this.appointment.isApproved;
      let res;
      try {
        // Update the appointment.
        res = await AppointmentService.updateAppointment(
          {
            isApproved: this.appointment.isApproved
          },
          this.appointment._id
        );
      } catch (error) {
        res = error.response;
      }
      this.setMessage(res.data.message, res.data.success);
    },

    // Save the notes about the appointments.
    async saveNotes(areCounsellorNotes) {
      let appointmentProperties = {};

      // If the notes are the counsellor notes, update the appointment's counsellor notes.
      // Else, update the client's notes.
      if (areCounsellorNotes) {
        appointmentProperties.counsellorNotes = this.appointment.counsellorNotes;
      } else {
        appointmentProperties.clientNotes = this.appointment.clientNotes;
      }

      let appointmentId = this.appointment._id;
      let res;
      try {
        // Update the appointment.
        res = await AppointmentService.updateAppointment(appointmentProperties, appointmentId);
      } catch (error) {
        res = error.response;
      }

      this.setMessage(res.data.message, res.data.success);
    },

    // Get the first and last names of the clients using their ids.
    getClientsNames: async function() {
      // Build a string of the ids in the form: '5e29e82bd1e75c7bc3a2dbcb,5e29e848d1e75c7bc3a2dbcc'
      let clientsIds = this.appointment.clients.reduce(
        (acc, id, index) =>
          // Append the client's id to the string.
          (acc += `${id}${
            index != this.appointment.clients.length - 1 ? "," : "" // Don't add a comma to the last client id of the array.
          }`),
        "" // Initial value of ''
      );

      let res;
      try {
        // Fetch the client's names
        res = await UserService.getUsersFromIds(clientsIds);
        this.clients = res.data.users;
      } catch (error) {
        // Display an error message.
        res = error.response;
        this.setMessage(res.data.message, res.data.success);
      }
    },

    // Get the name of the counsellor.
    getCounsellorName: async function() {
      let counsellorId = this.appointment.counsellorId;
      let result = await UserService.getUsersFromIds(counsellorId);
      this.counsellor = result.data.users[0]; // An array is returned, but it will only contain one item as we only passed one id.
    },

    // Set the error/success message on the page.
    setMessage(message, success) {
      this.message.content = message;
      this.message.success = success;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.wrapper {
  padding: 1rem;
  text-align: center;
  min-width: 80rem;
}

.appointment-details {
  list-style: none;
  text-align: left;
  margin-top: 2rem;

  &-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &:not(:last-child) {
      margin-bottom: 2rem;
    }

    .icon {
      width: 2.4rem;
      height: 2.4rem;
      margin-right: 2rem;
    }

    .approved {
      color: $color-approved;
    }

    .pending {
      color: $color-error;
    }
  }

  .attendance {
    h4 {
      display: inline-block;
      width: 20rem;
      margin-right: 4rem;
    }
    button {
      &:not(:last-child) {
        margin-right: 3rem;
      }
    }
  }

  .section {
    margin-top: 1rem;
    position: relative;
    textarea {
      resize: none;
      height: 20rem;
    }

    .save {
      position: absolute;
      bottom: 0;
      right: 0;
      margin: 1rem 0.6rem;
    }

    &.delete {
      margin-top: 5rem;
      width: 100%;

      .error {
        text-align: center;
        margin-bottom: 1rem;
      }
      button {
        width: 100%;
      }
    }
  }
}

.delete-dialogue-content {
  width: 30rem;
  h4 {
    &:not(:first-child) {
      margin-top: 0.5rem;
      font-style: italic;
      color: $color-grey;
    }
  }
  .dialogue-buttons {
    margin-top: 2rem;

    button {
      width: 27.5rem;
      &:not(:last-child) {
        margin-bottom: 0.5rem;
      }
    }
  }
}
</style>
