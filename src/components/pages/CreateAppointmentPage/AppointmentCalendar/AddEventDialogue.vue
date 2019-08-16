<template>
  <div class="wrapper">
    <div v-on-clickaway="closeDialogue" class="add-event-dialogue" :style="positionStyle">
      <h2>Add Event</h2>
    </div>
  </div>
</template>

<script>
import Utils from "@/utils";
import { mixin as clickaway } from "vue-clickaway";

export default {
  data() {
    return {
      elementWidth: 40,
      elementHeight: 30
    };
  },
  mixins: [clickaway],
  props: {
    dayRectangle: {}
  },
  methods: {
    closeDialogue() {
      this.$emit("close-dialogue");
    }
  },
  computed: {
    positionStyle: function() {
      // TODO: clean up function (variable names etc)
      // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
      // it also positions the dialogue somewhere not off the screenzs
      console.log(this.dayRectangle);
      let elementX, elementY;
      // get window dimensions
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      // convert dimensions of the dialogue box into pixels
      let elementHeightPx = Utils.convertRemToPixels(this.elementHeight);
      let elementWidthPx = Utils.convertRemToPixels(this.elementWidth);

      // buffer x and y to make dialogue look more natural
      let bufferY = 10;
      let bufferX = 10;

      // check to see if the day on the calendar is on the left or right side of the screen
      if (this.dayRectangle.left <= windowWidth / 2) {
        // on the left - move the dialogue box to the right (where there is more space)
        elementX = this.dayRectangle.left + this.dayRectangle.width + bufferX;
      } else {
        // on the right - move dialogue box to the left
        elementX = this.dayRectangle.left - elementWidthPx - bufferX;
      }

      // check to see if the dialoge will fit on the screen
      if (this.dayRectangle.top >= windowHeight - elementHeightPx) {
        // dialogue won't fit - move it up so that it does
        elementY = windowHeight - elementHeightPx - bufferY;
      } else {
        // dialogue fits
        elementY = this.dayRectangle.top + bufferY;
      }
      return {
        position: "fixed",
        left: `${elementX}px`,
        top: `${elementY}px`,
        color: "blue",
        width: `${this.elementWidth}rem`,
        height: `${this.elementHeight}rem`
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../../scss/global.scss";

// wrapper so other actions can't be triggered when user click outside the box.
.wrapper {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9000000;
}

.add-event-dialogue {
  z-index: 10000000;
  box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
  background-color: $color-white;
  border-radius: 10px;

  // TODO: style this
}
</style>