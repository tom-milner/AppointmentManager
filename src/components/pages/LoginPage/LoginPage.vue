<template>
  <div class="container">
    <card v-bind:showBack="true">
      <div class="item-container">
        <h1 class="heading-1">Login</h1>
        <div class="login-items">
          <div class="login-field">
            <h3>Username/Email</h3>
            <input>
          </div>
          <div class="login-field">
            <h3>Password</h3>
            <input type="password">
          </div>
        </div>
        <button class="primary-btn" v-on:click="sendLogin">Submit</button>
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
  methods: {
    
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.login-items {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  align-items: center;
  height: 20rem;
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

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}
</style>

