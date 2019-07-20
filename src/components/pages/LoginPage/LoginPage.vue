<template>
  <div class="container">
    <card v-bind:showBack="true">
      <div class="item-container">
        <h1 class="heading-1">Login</h1>
        <div class="login-items">
          <div class="login-field">
            <h3>Username/Email</h3>
            <input v-model="username" />
          </div>
          <div class="login-field">
            <h3>Password</h3>
            <input v-model="password" type="password" />
          </div>
        </div>
        <p class="errorText">{{errorMessage}}</p>
        <button class="primary-btn" v-on:click="login()">Submit</button>
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
      username: null,
      password: null,
      errorMessage: null
    };
  },
  methods: {
    login: async function() {
      const username = this.username;
      const password = this.password;
      try {
        await this.$store.dispatch("authentication/login", {
          username,
          password
        });
        this.$router.push("/home");
      } catch (err) {
        this.errorMessage = err.message;
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

  input {
    width: 100%;
    border-radius: $border-radius;
    text-decoration: none;
    outline: none;
    border: 1px solid $color-grey-light;
    padding: 0.5rem 0.75rem;
    height: 3rem;
    font-family: $font-family;
    transition: all 0.2s;
    font-size: 1.2rem;

    &:focus {
      border: 1px solid $color-primary;
    }
  }
}

.errorText {
  margin-bottom: 1rem;
}
</style>

