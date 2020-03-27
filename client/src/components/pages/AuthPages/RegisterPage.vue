<!--
  This page is used to register a new user to the application.
  Both clients and counsellors use this page to create an account, however if the user signing up is a counsellor they will have a counsellorToken token in the URL.
  This token is already embedded in the link the new counsellors are sent to use to create an account.
-->

<template>
  <div class="container">
    <card v-bind:showBack="true">
      <form v-on:submit.prevent="register()" class="item-container">
        <h2 class="heading-2">Register</h2>
        <div class="login-items">
          <div class="login-field">
            <h4 class="form-heading">Firstname</h4>
            <input class="form-input" v-model="firstname" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Lastname</h4>
            <input class="form-input" v-model="lastname" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Username</h4>
            <input class="form-input" v-model="username" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Email</h4>
            <input class="form-input" v-model="email" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Password</h4>
            <input class="form-input" v-on:input="checkConfirmPassword()" v-model="password" type="password" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Confirm Password</h4>
            <input class="form-input" v-on:input="checkConfirmPassword()" v-model="confirmPassword" type="password" />
          </div>
        </div>
        <h4 class="heading-4 error errorText">{{ errorMessage }}</h4>
        <button class="btn btn-primary">Submit</button>
      </form>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import UserAuthService from "@/services/UserAuthService";
import Roles from "@/models/Roles";
export default {
  components: {
    Card
  },
  data() {
    return {
      username: null, // The new username.
      email: null, // The new email.
      password: null, // The new password.
      confirmPassword: null, // The confirmed password.
      firstname: null, // The firstname of the new user.
      lastname: null, // The lastname of the new user.
      errorMessage: null, // The response error message (if there is one)
      passwordsMatch: false // Whether the password's match or not.
    };
  },

  computed: {
    checkConfirmPassword() {
      return this.password == this.confirmPassword;
    }
  },
  methods: {
    register: async function() {
      if (!this.checkConfirmPassword) {
        this.errorMessage = "Passwords don't match.";
        return;
      }

      // create user object to send
      const newUser = {
        username: this.username,
        email: this.email,
        password: this.password,
        firstname: this.firstname,
        lastname: this.lastname,
        counsellorToken: this.$route.query.token || "" // This included in the url for counsellors so they can can create counsellor accounts.
      };

      try {
        // If the user has been sent here by an email telling them to register a counsellor, there will be a registration token as part of the url.
        // This is required to register a new counsellor.
        if (newUser.counsellorToken) {
          await UserAuthService.registerUser(newUser, Roles.COUNSELLOR);
        } else {
          await UserAuthService.registerUser(newUser, Roles.CLIENT);
        }

        // redirect user to the login page, so they can acquire tokens for their new account.
        this.$router.push("/login");
      } catch (err) {
        this.errorMessage = err.response.data.message || "Error registering user.";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";
.container {
  height: 100vh;
  width: 100vw;
  background-color: $color-canvas;
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-container {
  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }
  width: 30rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.login-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  // height: 15rem;
}

.login-field {
  width: 30rem;
}

.errorText {
  margin-bottom: 1rem;
  text-align: center;
}
</style>
