<template>
  <div class="container">
    <card>
      <div class="items-container">
        <h1 class="heading-1">Appointment Manager</h1>
        <div class="options-container">
          <router-link to="/login" class="primary-btn">Login</router-link>
          <router-link to="/register" class="primary-btn">Register</router-link>
          <router-link to="/guest" class="primary-btn">Guest</router-link>
        </div>
      </div>
    </card>
  </div>
</template>

<script>
import Card from "@/components/layout/Card";

export default {
  components: { Card },
  mounted: function() {
    this.checkUserLoggedIn();
  },
  methods: {
    checkUserLoggedIn: function() {
      if (this.$store.getters["authentication/isLoggedIn"]) {
        this.$router.push("/home");
      }
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
