<template>
  <div class="container">
    <card v-bind:showBack="true">
      <div class="item-container">
        <h1 class="heading-1">Register</h1>
        <div class="login-items">
          <div class="login-field">
            <h3 class="form-heading">Firstname</h3>
            <input class="form-input" v-model="firstname" />
          </div>
          <div class="login-field">
            <h3 class="form-heading">Lastname</h3>
            <input class="form-input" v-model="lastname" />
          </div>
          <div class="login-field">
            <h3 class="form-heading">Username</h3>
            <input class="form-input" v-model="username" />
          </div>
          <div class="login-field">
            <h3 class="form-heading">Email</h3>
            <input class="form-input" v-model="email" />
          </div>
          <div class="login-field">
            <h3 class="form-heading">Password</h3>
            <input class="form-input" v-model="password" type="password" />
          </div>
          <div class="login-field">
            <h3 class="form-heading">Confirm Password</h3>
            <input
              class="form-input"
              v-on:input="checkConfirmPassword()"
              v-model="confirmPassword"
              type="password"
            />
          </div>
        </div>
        <p class="errorText" v-html="errorMessage" />
        <button class="primary-btn" v-on:click="register()">Submit</button>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import UserService from "@/services/UserService";
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
      this.passwordsMatch =
        this.password == this.confirmPassword ? true : false;
      console.log(this.passwordsMatch);
    },
    register: async function() {
      if (this.passwordsMatch) {
        // create user object to send
        const newUser = {
          username: this.username,
          email: this.email,
          password: this.password,
          firstname: this.firstname,
          lastname: this.lastname
        };

        try {
          // call the store authentication module to register the user.
          await UserService.registerUser(newUser);

          // redirect user to home page
          this.$router.push("/home");

          // catch and display errors
        } catch (err) {
          if (err.message != null) {
            this.errorMessage = "Error registering user";
          }
          this.errorMessage = err.message;
        }
      } else {
        this.errorMessage = "Passwords don't match";
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
}
</style>

