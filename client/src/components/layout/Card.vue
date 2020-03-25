<!--
  This file is for the card component that is used throughout the app.
  The card is a white box with rounded corners and sometimes a back arrow in the top left corner
-->

<template>
  <div class="card">
    <div v-if="showBack" v-on:click="goBack" class="icon-box">
      <icon name="arrow-left"></icon>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    // Navigate to the previous page when the goBack button is pressed.
    methods: {
      goBack: function () {
        // If a specific URL was specified navigate to it instead of going back.
        if (this.backUrl) this.$router.push(this.backUrl);
        else this.$router.go(-1);
      }
    },
    props: {
      showBack: Boolean,
      backUrl: String
    }
  };
</script>

<style lang="scss" scoped>
  @import "src/scss/global";

  .card {
    position: relative;
  }

  .content {
    padding: 4rem;
    border-radius: $border-radius;
    background-color: $color-white;
    box-shadow: -1px 2px 3px rgba($color-black, 0.2);
  }

  .icon-box {
    position: absolute;
    float: left;
    top: 0;
    left: 0;
    color: $color-black;
    padding: 1.5rem;

    .icon {
      height: 2rem;
    }

    font-size: 1rem;
  }
</style>
