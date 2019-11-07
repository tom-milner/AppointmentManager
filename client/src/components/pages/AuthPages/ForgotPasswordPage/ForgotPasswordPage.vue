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
            <p
              class="paragraph"
            >Pressing the send button will send a password reset email to the above address. Follow the instructions in the email to reset you password.</p>
          </div>
          <div class="row" v-if="message">
            <h4 class="heading-4 error message" :class="{success: sentSuccessfully  }">{{message}}</h4>
          </div>
          <div :disabled="triesRemaining < 1" class="row send-button">
            <button class="btn btn-primary">{{buttonContent}}</button>
          </div>
        </form>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import AuthenticationService from "@/services/AuthenticationService";
import Utils from "@/utils";
export default {
  components: {
    Card
  },
  data() {
    return {
      email: "",
      message: "",
      sentSuccessfully: false,
      buttonContent: "Send Email",
      triesRemaining: 3
    };
  },
  methods: {
    async sendEmail() {
      // data validation
      if (!this.email) {
        this.message = "Please enter a valid email.";
        return;
      }

      if (this.triesRemaining < 1) {
        this.message = "You can only send 3 emails a minute";
        this.sentSuccessfully = false;
        return;
      }

      // send the request.
      try {
        let response = await AuthenticationService.forgotPassword(this.email);
        console.log(response);

        if (!response.data.success) {
          throw response.data.message;
        } else {
          this.triesRemaining--;
          this.message = response.data.message;
          this.sentSuccessfully = true;
          this.buttonContent = "Didn't get it? Send again.";
        }
      } catch (error) {
        if (Utils.isString(error)) this.message = error;
        this.message = error.response.data.message;
      }
    }
  },
  mounted() {
    // reset amount of password tries every minute
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