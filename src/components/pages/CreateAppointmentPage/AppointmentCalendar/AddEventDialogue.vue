<template>
  <div class="add-event-dialogue" :style="positionStyle">
    <h2>Add Event</h2>
  </div>
</template>

<script>
import Utils from "@/utils";
export default {
  data() {
    return {
      elementWidth: 40,
      elementHeight: 30
    };
  },
  props: {
    dayRectangle: {}
  },
  computed: {
    positionStyle: function() {
      // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
      // it also positions the dialogue somewhere not off the screenzs
      console.log(this.dayRectangle);
      let elementX, elementY;
      // get window dimensions
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let elementHeightPx = Utils.convertRemToPixels(this.elementHeight);
      let elementWidthPx = Utils.convertRemToPixels(this.elementWidth);

      // check to see if the day on the calendar is on the left or right side of the screen
      if (this.dayRectangle.left <= windowWidth / 2) {
        // on the left - move the dialogue box to the right (where there is more space)
        elementX = this.dayRectangle.left + this.dayRectangle.width;
      } else {
        // on the right - move dialogue box to the left
        elementX = this.dayRectangle.left - elementWidthPx;
      }

      // check to see if the dialoge will fit on the screen
      if (this.dayRectangle.top >= windowHeight - elementHeightPx) {
        // dialogue won't fit - move it up so that it does
        elementY = windowHeight - elementHeightPx;
      } else {
        // dialogue fits
        elementY = this.dayRectangle.top;
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

.add-event-dialogue {
  z-index: 10000000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  background-color: $color-white;
  border-radius: 10px;
}
</style>