<!--
  This file is for the card component that is used throughout the app.
  The card is a white box with rounded corners and sometimes a back arrow in the top left corner
-->

<template>
  <div class="background">
    <div v-on-clickaway="closeDialogue" class="dialogue-box">
      <slot/>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
  mixins: [clickaway],
  methods: {

    // Forward on the close-dialogue event to the parent.
    closeDialogue() {
      this.$emit("close-dialogue");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global.scss";

.background {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  background-color: rgba($color-black, 0.1);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialogue-box {
  z-index: 1000;
  background-color: $color-white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

  .row {
    display: inline-block;
  }
}
</style>
