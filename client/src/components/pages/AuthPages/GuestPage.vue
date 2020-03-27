<!--
  This file is for the Guest Page.
  It allows a guest to create a temporary guest account and then book an appointment with that account.
  The booking form is the same one used on the Book Appointment page.
-->

<template>
  <div class="wrapper">
    <Card :showBack="true" backUrl="/">
      <div class="container">
        <div class="header">
          <h2 class="heading-2">Book An Appointment</h2>
        </div>
        <!-- User must enter their info first -->
        <div v-if="!appointmentCreated">
          <div class="guest-form" v-if="!guestCreated">
            <form v-on:submit.prevent="registerGuest">
              <div class="section">
                <h4 class="form-heading">Firstname:</h4>
                <input type="text" v-model="firstname" class="form-input" />
              </div>
              <div class="section">
                <h4 class="form-heading">Lastname:</h4>
                <input type="text" v-model="lastname" class="form-input" />
              </div>
              <div class="section">
                <h4 class="form-heading">Email:</h4>
                <input type="email" v-model="email" class="form-input" />
              </div>
              <div class="section">
                <h4 class="form-heading">Confirm email:</h4>
                <input type="email" v-model="confirmedEmail" class="form-input" />
              </div>
              <div class="section message">
                <h4 class="heading-4 error">{{ responseMessage }}</h4>
              </div>

              <div class="section saveEmail">
                <button class="btn btn-primary">Choose a time</button>
              </div>
            </form>
          </div>
          <!-- Let the user book an appointment -->
          <div v-else class="create-form">
            <BookAppointmentForm
              :specificCounsellor="counsellor"
              v-on:appointment-created="appointmentCreated = true"
            />
          </div>
        </div>
        <!-- Appointment Created -->
        <div v-if="appointmentCreated" class="completed-message">
          <h3 class="heading-3">Appointment created successfully. Check your email for details.</h3>
        </div>
      </div>
    </Card>
  </div>
</template>
<script>
import UserService from "@/services/UserService";
import UserAuthService from "@/services/UserAuthService";

import Card from "@/components/layout/Card";
import BookAppointmentForm from "@/components/misc/BookAppointmentForm";
import Roles from "@/models/Roles";

export default {
  data() {
    return {
      responseMessage: "", // The response success/error message.
      firstname: "", // The guest's firstname
      lastname: "", // The guest's lastname
      email: "", // The guest's email
      confirmedEmail: "", // The guests confirmed email.
      emailsMatch: false, // Whether the emails match or not.
      guestCreated: false, // Whether the guest has been created or not.
      counsellor: {}, // The counsellor that the booking link contains.
      appointmentCreated: false // Whether the appointment has been created or not.
    };
  },
  components: {
    Card,
    BookAppointmentForm
  },
  methods: {
    // Validate the user's input.
    validateInput() {
      if (!this.firstname) {
        this.responseMessage = "Invalid firstname";
        return false;
      }
      if (!this.lastname) {
        this.responseMessage = "Invalid lastname";
        return false;
      }
      if (!this.email) {
        this.responseMessage = "Invalid email.";
        return false;
      }

      if (!this.emailsMatch) {
        this.responseMessage = "Emails must match";
        return false;
      }
      return true;
    },

    // Register the guest.
    async registerGuest() {
      let validInput = this.validateInput();
      if (!validInput) return;
      let guest = {
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email
      };

      try {
        let response = await UserAuthService.registerUser(guest, Roles.GUEST);
        let { user, accessToken } = response.data;

        // Log the guest in.
        this.$store.commit("authentication/auth_success", {
          user,
          accessToken
        });
        this.guestCreated = true;
      } catch (error) {
        this.responseMessage = error.response.data.message;
      }
    }
  },
  watch: {
    // Check the emails match whenever one of the is edited (Note: unfortunately these can't be combined under watcher.)
    email(value) {
      this.emailsMatch = value === this.confirmedEmail;
    },
    confirmedEmail(value) {
      this.emailsMatch = value === this.email;
    }
  },

  async beforeCreate() {
    // Get the counsellor ID from the URL (It is base64 encoded).
    const counsellorId = window.atob(this.$route.params.counsellorId);
    try {
      // Get basic information about the counsellor.
      let response = await UserService.getReducedCounsellor(counsellorId);
      this.counsellor = response.data.counsellor;
    } catch (error) {
      // if counsellorId is invalid redirect user to landing page
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.wrapper {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: $color-canvas;
  display: flex;
  justify-content: center;
  align-items: center;

  .header {
    width: 100%;
    text-align: center;
  }
  .container {
    max-width: 70rem;

    .create-form {
      width: 50rem;
    }
    .guest-form {
      margin-top: 2rem;

      input {
        width: 100%;
      }
    }

    .completed-message {
      margin-top: 2rem;
      width: 50rem;
      text-align: center;
      color: $color-primary;
    }
  }
}

.section {
  &:not(:last-child) {
    margin-bottom: 1rem;
  }

  &.saveEmail {
    margin-top: 2rem;
    text-align: center;
    width: 100%;
    button {
      width: 50%;
    }
  }

  &.message {
    width: 100%;
    text-align: center;
  }
}
</style>
