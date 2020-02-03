<template>
  <div class="wrapper">
    <card showBack>
      <div class="container">
        <h2 class="heading-2">Forgot your password?</h2>
        <form v-on:submit.prevent="sendEmail">
          <div class="row">
            <h3 class="form-heading">Enter Email:</h3>
            <input class="form-input" v-model="email" type="email" />
          </div>
          <div class="row">
            <p class="paragraph">
              Pressing the send button will send a password reset email to the above address. Follow the instructions in
              the email to reset your password.
            </p>
          </div>
          <div class="row" v-if="message">
            <h4 class="heading-4 error message" :class="{ success: sentSuccessfully }">{{ message }}</h4>
          </div>
          <div :disabled="triesRemaining < 1" class="row send-button">
            <button class="btn btn-primary">{{ buttonContent }}</button>
          </div>
        </form>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import AuthenticationService from "@/services/AuthenticationService";
export default {
  components: {
    Card
  },
  data() {
    return {
      email: "", // The user's email
      message: "", // The error/success message.
      sentSuccessfully: false, // Whether the email was sent successfully or not.
      buttonContent: "Send Email", // The message inside the 'send' button.
      triesRemaining: 3 // The amount of tries the user has for sending the email.
    };
  },
  methods: {
    async sendEmail() {
      // Data validation
      if (!this.email) {
        this.message = "Please enter a valid email.";
        return;
      }
      // Don't let the user send the email if they've run out of tries.
      if (this.triesRemaining < 1) {
        this.message = "You can only send 3 emails a minute";
        this.sentSuccessfully = false;
        return;
      }

      // Ssend the request.
      let response;
      try {
        // Send the request.
        response = await AuthenticationService.forgotPassword(this.email);
        this.triesRemaining--;
        this.buttonContent = "Didn't get it? Send again.";
      } catch (error) {
        response = error.response;
      }
      this.message = response.data.message;
      this.sentSuccessfully = response.data.success;
    }
  },
  mounted() {
    // Reset amount of password tries every minute
    setInterval(function() {
      this.triesRemaining = 3;
    }, 60000);
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/_global.scss";

.wrapper {
  height: 100vh;
  width: 100vw;
  background-color: $color-canvas;
  display: flex;
  justify-content: center;
  align-items: center;
  .container {
    width: 40rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .row {
      margin-top: 2rem;
      width: 100%;

      &.send-button {
        display: flex;
        align-items: center;
        justify-content: center;
        button {
          width: 100%;
        }
      }
    }
  }

  .message {
    text-align: center;
  }
}
</style>
