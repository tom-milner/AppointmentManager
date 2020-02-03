<template>
  <div class="wrapper">
    <Card showBack backUrl="/">
      <div class="container">
        <h2 class="heading-2">Reset Password</h2>
        <form v-on:submit.prevent="resetPassword">
          <div class="row">
            <h3 class="form-heading">New Password</h3>
            <input v-model="password" type="password" class="form-input" />
          </div>
          <div class="row">
            <h3 class="form-heading">Confirm Password</h3>
            <input v-model="confirmedPassword" type="password" class="form-input" />
          </div>
          <div class="row">
            <h4 class="heading-4 error message">{{ message }}</h4>
          </div>
          <div class="row reset-button">
            <button class="btn btn-primary">Reset Password</button>
          </div>
        </form>
      </div>
    </Card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import AuthenticationService from "@/services/AuthenticationService";
import Utils from "@/utils";

export default {
  data() {
    return {
      token: "", // The password reset token.
      password: "", // The new password
      confirmedPassword: "", // The new password confirmed.
      message: "" // The error/success message.
    };
  },
  components: {
    Card
  },

  methods: {
    // Reset the user's password.
    async resetPassword() {
      // Make sure the user has entered the same password twice.
      if (this.password != this.confirmedPassword) {
        this.message = "Passwords don't match";
        return;
      }

      // Send request
      try {
        let response = await AuthenticationService.resetPassword(this.password, this.token);
        if (response.data.success) {
          // remove any current user credentials.
          AuthenticationService.logoutUser();
          // send user to login page
          this.$router.push("/auth/login");
        } else {
          // display error message
          this.message = response.data.message;
        }
      } catch (error) {
        if (Utils.isString(error)) this.message = error;
        else this.message = error.response.data.message;
      }
    }
  },

  mounted() {
    // Get token from url
    if (!this.$route.query.token) {
      // If there's no token redirect the user back to the landing page.
      this.$router.push("/");
    } else {
      this.token = this.$route.query.token;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-canvas;
  .container {
    width: 40rem;

    h2 {
      text-align: center;
    }
    .row {
      margin-top: 2rem;
      width: 100%;
    }
  }
}

.message,
.reset-button {
  text-align: center;
  button {
    width: 100%;
  }
}
</style>
