<template>
  <div class="wrapper">
    <card showBack>
      <div class="container">
        <h2 class="heading-2">Reset Password</h2>
        <form v-on:submit.prevent="sendEmail">
          <div class="row">
            <h3 class="form-heading">Enter Email:</h3>
            <input class="form-input" v-model="email" type="email" />
          </div>
          <div class="row">
            <p
              class="paragraph"
            >Pressing the save button will send a password reset email to the above address. Follow the instructions in the email to reset you password.</p>
          </div>
          <div class="row">
            <h4 class="heading-4 error errorText">{{errorMessage}}</h4>
          </div>
          <div class="row send-button">
            <button class="btn btn-primary">Send Email</button>
          </div>
        </form>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
export default {
  components: {
    Card
  },
  data() {
    return {
      email: "",
      errorMessage: ""
    };
  },
  methods: {
    sendEmail() {
      // data validation
      if (!this.email) {
        this.errorMessage = "Please enter a valid email.";
        return;
      }

      // send the request.
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/_global.scss";

.wrapper {
  height: 100vh;
  width: 100%;
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

  .errorText {
    text-align: center;
  }
}
</style>