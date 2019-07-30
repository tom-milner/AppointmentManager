<template>
  <div class="modal" :class="{fullscreenModal: isFullscreen}">
    <transition appear name="fade">
      <div
        class="modal__content"
        :class="{fullscreenModal__content: isFullscreen}"
        v-on-clickaway="close"
      >
        <div class="icon-box">
          <Icon class="fullscreenIcon" name="maximize" v-on:click.native="toggleFullscreen()"></Icon>
        </div>
        <slot></slot>
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
      isFullscreen: false
    };
  },

  methods: {
    close: function() {
      return this.$emit("close-modal");
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/global.scss";

.icon-box {
  float: left;
  text-align: center;
  .fullscreenIcon {
    height: 2rem;
    width: 2rem;
    transition: all 0.2s ease-in-out;
  }

  &:hover .fullscreenIcon {
    color: $color-primary;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}
.fade-leave-to {
  transform: translateX(100%);
}

.fade-enter {
  transform: translateX(100%);
}

.modal {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  // background-color: rgba($color-black, 0.2);
  // z-index: -1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  z-index: 100;
  background-color: rgba($color-black, 0.1);

  &__content {
    background-color: $color-white;
    width: 40%;
    height: 95%;
    margin-right: 2rem;
    z-index: 10000;

    // border-radius: 10px 0 0 10px;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    /*display: flex;
            flex-direction: column;*/
    overflow: auto;
    padding: 2rem;
  }
}

.fullscreenModal {
  background-color: rgba($color-black, 0.2);
  transition: all 0.2s;
  justify-content: center;

  &__content {
    height: auto;
    max-height: 80%;
    border-radius: 10px;
  }
}
</style>
