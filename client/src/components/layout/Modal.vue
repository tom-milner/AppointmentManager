<!--
  This file is for the modal component that is used throughout the app.
  The modal is the white box with rounded corners that slides in from the right.
-->

<template>
  <transition appear name="slide">
    <div class="modal-content" :class="{ 'fullscreen-modal': isFullscreen}" v-on-clickaway="close">
      <div class="icons">
        <div class="icon-box">
          <icon class="icon" name="maximize" v-on:click.native="toggleFullscreen()"/>
        </div>
        <div class="icon-box" v-if="canPrint">
          <icon class="icon" name="printer" v-on:click.native="printModal()"/>
        </div>
      </div>
      <div id="printContents">
        <slot class="slot"/>
      </div>
    </div>
  </transition>
</template>

<script>
  import {mixin as clickaway} from "vue-clickaway";

  export default {
    mixins: [clickaway],

    props: {
      //   Whether the user can print the modal or not.
      canPrint: Boolean
    },

    data() {
      return {
        // Whether the modal is in fullscreen mode or not.
        isFullscreen: false
      };
    },

    methods: {
      // Call the parent to close the modal.
      close: function () {
        return this.$emit("close-modal");
      },
      // Make the modal fulscreen or not fullscreen.
      toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
      },

      // Pring the modal by  opening an invisible window containing the modal contents and printing the new window
      printModal() {
        // Get HTML to print from element
        const prtHtml = document.getElementById("printContents").innerHTML;

        // Get all stylesheets HTML
        let stylesHtml = "";
        for (const node of [...document.querySelectorAll('link[rel="stylesheet"], style')]) {
          stylesHtml += node.outerHTML;
        }

        // Open the print window
        const winPrint = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0");

        const printHTML = `<!DOCTYPE html>
                            <html>
                              <head>
                                ${stylesHtml}
                              </head>
                              <body>
                                ${prtHtml}
                              </body>
                            </html>`;

        // Write the modal html to the window.
        winPrint.document.write(printHTML);

        // Instantly close the document so that the user doesn't see it.
        winPrint.document.close();

        // Print and close the window.
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
    //   z-index: 998;
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

  // Animation styles.
  .slide-enter-active,
  .slide-leave-active {
    /*transition: transform .6s cubic-bezier(0.68, -0.6, 0.32, 1.6);*/
    transition: transform .6s cubic-bezier(0.25, 1, 0.5, 1)
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateX(calc(100% + 2rem));
  }


  .modal-content {
    background-color: $color-white;
    height: 95%;
    z-index: 998;
    border-radius: 10px;
    box-shadow: 0 10px 75px rgba(0, 0, 0, 0.30);
    position: fixed;
    top: 2.5%;
    right: 0;
    margin-right: 1rem;

    overflow: auto;
    padding: 2rem;
  }


  .fullscreen-modal {
    width: 90%;
    right: 5%;
    margin-right: 0;
  }

  #printContents {
    width: 100%;
    height: 100%;
  }

  .slot {
    padding: 1rem;
  }
</style>
