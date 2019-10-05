<template>
  <div class="modal" id="modal" :class="{fullscreenModal: isFullscreen}">
    <transition appear name="slide">
      <div class="modal-content">
        <div class="icons">
          <div class="icon-box">
            <Icon class="icon" name="maximize" v-on:click.native="toggleFullscreen()"></Icon>
          </div>
          <div class="icon-box">
            <Icon class="icon" name="printer" v-on:click.native="printModal()"></Icon>
          </div>
        </div>
        <div
          class="modal__content"
          id="printContents"
          :class="{fullscreenModal: isFullscreen}"
          v-on-clickaway="close"
        >
          <slot class="slot"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";
import Icon from "vue-icon/lib/vue-feather.esm";

export default {
  mixins: [clickaway],
  components: {
    Icon
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
      // hide any buttons
      // let buttons = document.querySelectorAll("button");
      // buttons.forEach(btn => {
      //   btn.style.display = "none";
      // });

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
      const WinPrint = window.open(
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

      WinPrint.document.write(printHTML);

      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();

      // redisplay al buttons
      // buttons.forEach(btn => {
      //   btn.style.display = "block";
      // });
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
}

.icon-box {
  display: inline;
  &:not(:last-child) {
    margin-right: 1rem;
  }
  .icon {
    height: 2rem;
    width: 2rem;
    transition: all 0.2s ease-in-out;
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
    width: auto;
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

  &-content {
    height: auto;
    max-height: 95%;
    width: 95%;
    border-radius: 10px;
  }
}
</style>
