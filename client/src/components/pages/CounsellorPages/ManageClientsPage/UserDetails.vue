<template>
  <div class="wrapper">
    <div class="content">
      <!-- Heading-->
      <div class="icon-box" v-on:click="$router.go(-1)">
        <icon name="arrow-left"></icon>
      </div>
      <h2 class="heading-2">{{ fullClient.firstname }} {{ fullClient.lastname }}</h2>

      <ul class="user-details">
        <li class="user-details-row">
          <h4 class="heading-4 header">Username:</h4>
          <h4 class="heading-4">{{ fullClient.username }}</h4>
        </li>
        <li class="user-details-row">
          <h4 class="heading-4 header">Fullname:</h4>
          <h4 class="heading-4">{{ fullClient.firstname }} {{ fullClient.lastname }}</h4>
        </li>
        <li class="user-details-row">
          <h4 class="heading-4 header">Email:</h4>
          <a :href="`mailto:${fullClient.email}`" class="heading-4">{{ fullClient.email }}</a>
        </li>

        <!-- Clinical Notes -->
        <li class="section clinical-notes">
          <h3 class="heading-3">Clinical Notes</h3>
          <textarea class="form-input notes-edit" v-model="fullClient.clinicalNotes"></textarea>
          <button @click="saveClinicalNotes" class="btn btn-primary save-button">Save Clinical Notes</button>
        </li>

        <!-- Error Message -->
        <li class="section" v-if="message.content.length > 0">
          <h4 class="heading-4 error" :class="{ success: message.success }">{{ message.content }}</h4>
        </li>
      </ul>

      <!-- Calendar -->
      <div class="section calendar">
        <h3 class="heading-3">{{ fullClient.firstname }}'s Calendar</h3>
        <appointment-calendar :clientAppointments="clientAppointments"></appointment-calendar>
      </div>
    </div>

    <!-- Delete Button -->
    <div class="delete-account">
      <button @click="showDeleteDialogue = true" class="btn btn-disapproved">Delete User</button>
    </div>

    <!-- Delete Dialogue -->
    <Dialogue @close-dialogue="showDeleteDialogue = false" v-if="showDeleteDialogue">
      <div class="dialogue-content">
        <h4 class="heading-4">Are you sure you want to delete this user?</h4>
        <div class="dialogue-row">
          <button @click="deleteUser" class="btn btn-disapproved">Yes</button>
          <button @click="showDeleteDialogue = false" class="btn btn-approved">No</button>
        </div>
      </div>
    </Dialogue>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import Utils from "@/utils";
import Dialogue from "@/components/layout/DialogueBox";
import AppointmentService from "@/services/AppointmentService";
import AppointmentCalendar from "@/components/misc/Calendar/AppointmentCalendar";

export default {
  props: {},
  data() {
    return {
      fullClient: {},
      message: { content: "", success: false },
      showDeleteDialogue: false,
      clientEvents: {},
      clientAppointments: [],
      selectedAppointment: {},
      modalDisplayed: false
    };
  },
  components: {
    Dialogue,
    AppointmentCalendar
  },
  async created() {
    let response = await UserService.getClient(this.$route.params.clientId);
    this.fullClient = response.data.client;

    await this.getUserAppointments();
  },

  methods: {
    async getUserAppointments() {
      try {
        let response = await AppointmentService.getAppointmentsOfUser({
          userId: this.fullClient._id
        });
        this.clientAppointments = response.data.appointments;
      } catch (error) {
        console.log(error);
      }
    },

    async deleteUser() {
      let response;
      try {
        response = await UserService.deleteUser(this.fullClient._id);
        this.showDeleteDialogue = false;
        this.$router.go(-1);
      } catch (error) {
        console.log(error);
        response = error.response;
      }
      this.message.content = response.data.message;
      this.message.success = response.data.success;
    },

    async saveClinicalNotes() {
      let response;
      try {
        if (!this.fullClient.clinicalNotes) {
          this.message.content = "No clinical notes provided.";
          this.message.success = false;
          return;
        }
        response = await UserService.updateUser(this.fullClient._id, {
          clinicalNotes: this.fullClient.clinicalNotes
        });
      } catch (error) {
        if (Utils.isString(error)) return (this.message = error);
        response = error.response;
      }

      this.message.content = response.data.message;
      this.message.success = response.data.success;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.wrapper {
  position: relative;
  overflow: scroll;
  height: 100%;

  .delete-account {
    // width: 100%;
    position: absolute;
    bottom: 0;
    left: 1rem;
    padding: 0 1rem;
    margin-bottom: 1rem;
    button {
      width: 30rem;
    }
  }
}

.content {
  .icon-box {
    width: 2.5rem;
    height: 2.5rem;
    color: $color-primary;
    display: inline-block;
    margin-right: 1rem;
    vertical-align: middle;
    cursor: pointer;
  }

  h2 {
    display: inline;
    vertical-align: middle;
  }
  .user-details {
    list-style: none;
    margin-top: 2rem;

    &-row {
      margin-top: 1rem;

      h4 {
        display: inline-block;
      }
      .header {
        font-weight: 500;
        width: 10rem;
        margin-right: 2rem;
      }
    }
  }

  .section {
    margin-top: 4rem;

    &.calendar {
      margin-bottom: 10rem;
      // width: 90%;
    }

    &.clinical-notes {
      min-height: 30rem;
      width: 75rem;
      position: relative;

      textarea {
        min-height: 30rem;
        resize: vertical;
        width: 100%;
      }
      .save-button {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
      }
    }
  }
}

.dialogue-content {
  height: 100%;
  width: 30rem;
  text-align: center;

  h4 {
    span {
      color: $color-error;
    }
    &:not(:first-child) {
      margin-top: 0.5rem;
      font-size: 1.5rem;
      font-style: italic;
      color: $color-grey;
    }
  }
  .dialogue-row {
    margin-top: 3rem;
    display: flex;
    justify-content: space-around;
    width: 100%;
    button {
      width: 45%;
    }
  }
}
</style>
