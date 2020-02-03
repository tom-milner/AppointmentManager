<template>
  <div class="container">
    <card :showBack="true" backUrl="/">
      <form v-on:submit.prevent="login" class="item-container">
        <h2 class="heading-2">Login</h2>
        <div class="login-items">
          <div class="login-field">
            <h4 class="form-heading">Username or Email</h4>
            <input class="form-input" v-model="username" />
          </div>
          <br />
          <div class="login-field">
            <h4 class="form-heading">Password</h4>
            <input class="form-input" v-model="password" type="password" />
          </div>
        </div>
        <h4 class="heading-4 error errorText">{{ errorMessage }}</h4>
        <div class="action-row">
          <router-link to="/auth/forgot-password">
            <p class="paragraph">Forgot password?</p>
          </router-link>
          <button class="btn btn-primary">Submit</button>
        </div>
      </form>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";
import UserAuthService from "@/services/UserAuthService";
export default {
  components: {
    Card
  },
  data() {
    return {
      username: null, // The user's username
      password: null, // The user's password
      errorMessage: null // The error message (if there is one).
    };
  },
  methods: {
    // Log the user in - this works for any type of user.
    login: async function() {
      const username = this.username;
      const password = this.password;
      try {
        await UserAuthService.loginUser(username, password);
        this.$router.push("/home"); // Redirect the user to the home page on successful login.
      } catch (err) {
        this.errorMessage = err.response.data.message;
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
  h3 {
    font-size: 1.5rem;
    font-weight: 300;
    margin-bottom: 0.3rem;
  }
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  button {
    display: inline;
  }
  p {
    display: inline;
  }
}

.errorText {
  margin-bottom: 1rem;
}
</style>
