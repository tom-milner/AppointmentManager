<template>
  <!-- All displays are rendered within the app div -->
  <div class="app">
    <Navigation class="app-navigation" v-if="!$route.meta.hideNavigation"></Navigation>
    <router-view class="app-main"></router-view>
  </div>
</template>

<style lang="scss">
@import "src/scss/global";

.app {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  width: 100%;
  height: 100%;
}
.app-navigation {
  order: 0;
  width: $nav-width;
  max-width: 10rem;
}

// TODO: flash messages

.app-main {
  order: 1;
  flex-grow: 1;
  padding: 2.5rem;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
}
</style>

<script>
import Navigation from "@/components/layout/Navigation";
export default {
  components: {
    Navigation
  },
  mounted: function() {
    this.hideNavigation = this.$route.meta.hideNavigation;
  },
  data() {
    return {
      hideNavigation: false
    };
  }
};
</script>
