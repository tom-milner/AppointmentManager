<template>
  <!-- All displays are rendered within the app div -->
  <div class="app">
    <Navigation class="app-navigation" v-if="!$route.meta.hideNavigation"></Navigation>
    <router-view class="app-main" :style="getNoNavbarStyle"></router-view>
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
  background-color: $color-canvas;
}
.app-navigation {
  order: 0;
  width: $nav-width;
}

.app-main {
  order: 1;
  flex-grow: 1;
  padding: 2.5rem;
  margin-left: 3.5rem;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  border-radius: 25px 0 0 25px;
  box-shadow: -2px 1px 1px rgba($color-grey, 0.2);

  background-color: $color-white;
}
</style>

<script>
import Navigation from "@/components/layout/Navigation";
export default {
  components: {
    Navigation
  },
  computed: {
    // Style the page differently if there is no navbar.
    getNoNavbarStyle() {
      if (this.$route.meta.hideNavigation) {
        return { "border-radius": "0", margin: "0" };
      } else {
        return {};
      }
    }
  },
  created() {
    // Hide the navigagtion bar if required.
    this.hideNavigation = this.$route.meta.hideNavigation;
  },
  data() {
    return {
      hideNavigation: false // Whether to hide the navigation bar or not.
    };
  }
};
</script>
