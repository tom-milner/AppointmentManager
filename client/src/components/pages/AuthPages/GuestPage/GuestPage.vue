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
                <h4 class="heading-4 error">{{message}}</h4>
              </div>

              <div class="section saveEmail">
                <button class="btn btn-primary">Choose a time</button>
              </div>
            </form>
          </div>
          <!-- Let the user book an appointment -->
          <div v-else class="create-form">
            <CreateAppointmentForm
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
import Card from "@/components/layout/Card";
import CreateAppointmentForm from "@/components/misc/CreateAppointmentForm";
import Role from "@/models/Role";

export default {
  data() {
    return {
      message: "",
      firstname: "",
      lastname: "",
      email: "",
      confirmedEmail: "",
      emailsMatch: false,
      guestCreated: false,
      user: {},
      counsellor: {},
      appointmentCreated: false
    };
  },
  components: {
    Card,
    CreateAppointmentForm
  },
  methods: {
    validateInput() {
      if (!this.firstname) {
        this.message = "Invalid firstname";
        return false;
      }
      if (!this.lastname) {
        this.message = "Invalid lastname";
        return false;
      }
      if (!this.email) {
        this.message = "Invalid email.";
        return false;
      }

      if (!this.emailsMatch) {
        this.message = "Emails must match";
        return false;
      }
      return true;
    },
    async registerGuest() {
      let validInput = this.validateInput();
      if (!validInput) return;
      let guest = {
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email
      };

      try {
        let response = await UserService.registerUser(guest, Role.Guest);
        console.log(response);
        let { user, accessToken } = response.data;
        this.$store.commit("authentication/auth_success", {
          user,
          accessToken
        });
        this.guestCreated = true;
      } catch (error) {
        this.message = error.response.data.message;
      }
    }
  },
  watch: {
    confirmedEmail(value) {
      this.emailsMatch = value == this.email;
    }
  },
  async beforeCreate() {
    const counsellorId = window.atob(this.$route.params.counsellorId);
    console.log(counsellorId);
    try {
      let response = await UserService.getReducedCounsellor(counsellorId);
      this.counsellor = response.data.counsellor;
    } catch (error) {
      console.log(error);
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