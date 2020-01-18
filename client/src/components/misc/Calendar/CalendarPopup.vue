<template>
  <div class="wrapper">
    <div v-on-clickaway="closePopup" :style="positionPopup" id="popup">
      <slot id="slot"></slot>
    </div>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
  data() {
    return {
      popupWidth: 0,
      popupHeight: 0,
      popup: {},
      observer: {}
    };
  },
  methods: {
    closePopup() {
      this.$emit("close-popup");
    },
    getPopupDimensions() {
      // adjust dimensions to fit content
      this.popup = document.querySelector("#popup");
      const popupRect = this.popup.getBoundingClientRect();
      this.popupWidth = popupRect.width;
      this.popupHeight = popupRect.height;
    }
  },
  mounted() {
    this.getPopupDimensions();

    // create observer to reposition popup when slot contents changes.
    this.observer = new MutationObserver(this.getPopupDimensions);

    // setup the observer
    this.observer.observe(this.popup, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  },
  beforeDestroy() {
    this.observer.disconnect();
  },

  props: {
    // spaceClicked is an object that should be obtained using getBoundingClientRect()
    spaceClicked: {}
  },

  mixins: [clickaway],
  computed: {
    positionPopup() {
      // this function returns a css class that will position the dialogue box somewhere that doesn't obstruct the user's view of the day.
      // it also positions the dialogue somewhere not off the screenzs

      // get window dimensions
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;

      // offset x and y to make the popup look more natural
      const offsetY = 10;
      const offsetX = 10;

      // The final styling of the object.
      let finalStyle = {};

      // check to see if the day on the calendar is on the left or right side of the screen
      if (this.spaceClicked.left <= windowWidth / 2) {
        // on the left - move the dialogue box to the right (where there is more space)
        finalStyle.left = `${this.spaceClicked.left +
          this.spaceClicked.width +
          offsetX}px`;
      } else {
        // on the right - move dialogue box to the left
        finalStyle.right = `${windowWidth -
          this.spaceClicked.left +
          offsetX}px`;
      }

      // check to see if the dialoge will fit on the screen
      if (this.spaceClicked.top >= windowHeight - this.popupHeight - offsetY) {
        // dialogue won't fit - set it's positioning using the "bottom" property so that it remains on the screen.
        finalStyle.bottom = `${offsetY}px`;
      } else {
        // dialogue fits
        finalStyle.top = `${this.spaceClicked.top + offsetY}px`;
      }

      return finalStyle;
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

#popup {
  z-index: 100;
  box-shadow: 5px 5px 30px rgba(0, 0, 0, 0.4);
  background-color: $color-white;
  border-radius: 10px;
  padding: 2rem;
  position: fixed;
  width: 40rem;
}
</style>
