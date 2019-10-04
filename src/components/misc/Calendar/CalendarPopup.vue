<template>
  <div class="wrapper">
    <div v-on-clickaway="closePopup" :style="positionStyle" class="popup">
      <slot id="slot"></slot>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";
import Utils from "@/utils";

export default {
  data() {
    return {
      // default height + width
      popupWidth: 40,
      popupHeight: 35
    };
  },
  methods: {
    closePopup() {
      this.$emit("close-popup");
    }
  },
  mounted() {
    // adjust dimensions to fit content
    let popup = document.querySelector(".popup").getBoundingClientRect();
    let width = Utils.convertPixelsToRem(popup.width);
    let height = Utils.convertPixelsToRem(popup.height);
    this.popupWidth = width;
    this.popupHeight = height;
  },
  props: {
    // spaceClicked is an object that should be obtained using getBoundingClientRect()
    spaceClicked: {}
  },

  mixins: [clickaway],
  computed: {
    positionStyle() {
      // TODO: clean up function (variable names etc)
      // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
      // it also positions the dialogue somewhere not off the screenzs
      let elementX, elementY;
      // get window dimensions
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      // convert dimensions of the dialogue box into pixels
      let popupHeightPx = Utils.convertRemToPixels(this.popupHeight);
      let popupWidthPx = Utils.convertRemToPixels(this.popupWidth);

      // buffer x and y to make dialogue look more natural
      let bufferY = 10;
      let bufferX = 10;

      // the rectangle of screen used by the element
      let elementRectangle = this.spaceClicked;

      // check to see if the day on the calendar is on the left or right side of the screen
      if (elementRectangle.left <= windowWidth / 2) {
        // on the left - move the dialogue box to the right (where there is more space)
        elementX = elementRectangle.left + elementRectangle.width + bufferX;
      } else {
        // on the right - move dialogue box to the left
        elementX = elementRectangle.left - popupWidthPx - bufferX;
      }

      // check to see if the dialoge will fit on the screen
      if (elementRectangle.top >= windowHeight - popupHeightPx) {
        // dialogue won't fit - move it up so that it does
        elementY = windowHeight - popupHeightPx - bufferY;
        // make extra room underneath popup
        elementY -= 40;
      } else {
        // dialogue fits
        elementY = elementRectangle.top + bufferY;
      }
      return {
        position: "fixed",
        left: `${elementX}px`,
        top: `${elementY}px`,
        width: `${this.popupWidth}rem`,
        minHeight: `${this.popupHeight}rem`
      };
    }
  }
};
</script>


<style lang="scss" scoped>
@import "src/scss/global.scss";

// wrapper so other actions can't be triggered when user click outside the box.
.wrapper {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
}

.popup {
  z-index: 100;
  box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
  background-color: $color-white;
  border-radius: 10px;
  padding: 2rem;
}
</style>