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
            <input class="form-input" v-model="password" type="password" />
          </div>
          <div class="login-field">
            <h4 class="form-heading">Confirm Password</h4>
            <input
              class="form-input"
              v-on:input="checkConfirmPassword()"
              v-model="confirmPassword"
              type="password"
            />
          </div>
        </div>
        <h4 class="heading-4 error errorText">{{errorMessage}}</h4>
        <button class="btn btn-primary">Submit</button>
      </form>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import UserService from "@/services/UserService";
import Roles from "@/models/Roles";
export default {
  components: {
    Card
  },
  data() {
    return {
      username: null,
      email: null,
      password: null,
      confirmPassword: null,
      firstname: null,
      lastname: null,
      errorMessage: null,
      passwordsMatch: false
    };
  },
  methods: {
    checkConfirmPassword: async function() {
      // ternary operator to reduce code
      this.passwordsMatch = this.password == this.confirmPassword;
    },

    register: async function() {
      if (!this.passwordsMatch) {
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
        counsellorToken: this.$route.query.token || ""
      };

      try {
        // If the user has been sent here by an email telling them to register a counsellor, there will be a registration token as part of the url.
        // This is required to register a new counsellor.
        if (newUser.counsellorToken) {
          await UserService.registerUser(newUser, Roles.COUNSELLOR);
        } else {
          await UserService.registerUser(newUser, Roles.CLIENT);
        }

        // redirect user to the login page, so they can aquire tokens for their new account.
        this.$router.push("/login");
      } catch (err) {
        this.errorMessage =
          err.response.data.message || "Error registering user.";
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

