<!--
  This file contains the Landing Page component.
  It allows the user to either login or register (via links).
-->

<template>
  <div class="container">
    <card>
      <div class="items-container">
        <h1 class="heading-1">Appointment Manager</h1>
        <div class="options-container">
          <router-link to="/auth/login" class="btn btn-primary">Login</router-link>
          <router-link to="/auth/register" class="btn btn-primary">Register</router-link>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";

export default {
  components: { Card },
  created() {
    // If the user is already logged in, redirect them to the home page.
    if (this.$store.getters["authentication/isLoggedIn"]) {
      this.$router.push("/home");
    }
  }
};
</script>

<style scoped lang="scss">
@import "src/scss/global";

.container {
  height: 100vh;
  width: 100vw;
  background-color: $color-canvas;
  display: flex;
  justify-content: center;
  align-items: center;
}

.items-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 14rem;
}

.options-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: space-around;
}
</style>
