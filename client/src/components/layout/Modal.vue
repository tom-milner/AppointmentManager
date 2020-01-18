<template>
  <div class="modal" id="modal" :class="{fullscreenModal: isFullscreen}">
    <transition appear name="slide">
      <div class="modal-content" v-on-clickaway="close">
        <div class="icons">
          <div class="icon-box">
            <icon class="icon" name="maximize" v-on:click.native="toggleFullscreen()"></icon>
          </div>
          <div class="icon-box" v-if="canPrint">
            <icon class="icon" name="printer" v-on:click.native="printModal()"></icon>
          </div>
        </div>
        <div id="printContents">
          <slot class="slot"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
  mixins: [clickaway],

  props: {
    canPrint: Boolean
  },

  data() {
    return {
      isFullscreen: false,
      isPrintView: false
    };
  },

  methods: {
    close: function() {
      return this.$emit("close-modal");
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    printModal() {
      // Get HTML to print from element
      const prtHtml = document.getElementById("printContents").innerHTML;

      // Get all stylesheets HTML
      let stylesHtml = "";
      for (const node of [
        ...document.querySelectorAll('link[rel="stylesheet"], style')
      ]) {
        stylesHtml += node.outerHTML;
      }

      // Open the print window
      const winPrint = window.open(
        "",
        "",
        "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
      );

      const printHTML = `<!DOCTYPE html>
<html>
  <head>
    ${stylesHtml}
  </head>
  <body>
    ${prtHtml}
  </body>
</html>`;

      winPrint.document.write(printHTML);

      winPrint.document.close();
      winPrint.focus();
      winPrint.print();
      winPrint.close();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/global.scss";

.icons {
  top: 0;
  margin-top: 2rem;
  margin-left: 2rem;
  left: 0;
  position: absolute;
  z-index: 30000;
}

.icon-box {
  display: inline-block;
  height: 2rem;
  width: 2rem;
  &:not(:last-child) {
    margin-right: 1rem;
  }
  .icon {
    height: 2rem;
    width: 2rem;
    transition: all 0.2s;
  }

  &:hover .icon {
    color: $color-primary;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s;
}
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter {
  transform: translateX(100%);
}
.modal {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  z-index: 100;
  background-color: rgba($color-black, 0.1);

  &-content {
    background-color: $color-white;
    height: 95%;
    margin-right: 2rem;
    z-index: 10000;
    position: relative;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

    overflow: auto;
    padding: 2rem;
  }
}

.fullscreenModal {
  background-color: rgba($color-black, 0.2);
  transition: all 0.2s;
  justify-content: center;

  .modal-content {
    width: 90%;
    margin-right: 0;
  }
}

#printContents {
  width: 100%;
  height: 100%;
}

.slot {
  padding: 1rem;
}
</style>
