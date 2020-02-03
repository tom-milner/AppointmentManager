<template>
  <div class="wrapper">
    <div class="inner">
      <div
        class="color-box"
        @click="setColor(color)"
        :style="getColorStyle(color)"
        v-for="color in colors"
        :key="color"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    colors: Array // The colors to choose from.
  },
  data() {
    return {
      chosenColor: "" // The color chosen.
    };
  },
  methods: {
    // Set the chosen color.
    setColor(color) {
      this.chosenColor = color;
      this.$emit("input", color); // Emit the chosen color to the parent.
    },

    // Style the color box.
    getColorStyle(color) {
      let styleObject = {
        "background-color": color
      };

      // If this color matches the chosen color, enlarge it.
      if (this.chosenColor == color) {
        styleObject.width = "4rem";
        styleObject.height = "4rem";
      }

      return styleObject;
    }
  },
  mounted() {
    // The value given to v-model on the parent component is stored in "$attrs.value" - Here we set the initial chosen color.
    this.chosenColor = this.$attrs.value;
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
}
.inner {
  min-width: 20rem;
  min-height: 4rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .color-box {
    vertical-align: middle;
    position: relative;
    height: 3rem;
    width: 3rem;
    display: inline-block;
    border-radius: 5px;

    transition: all 0.2s;

    &:not(:last-child) {
      margin-right: 1rem;
    }

    &:hover:after {
      background-color: rgba(#000, 0.1);
      z-index: 100;
    }
    &:after {
      content: "";
      position: absolute;
      left: 0px;
      right: 0px;
      top: 0px;
      bottom: 0px;
      border: 2px solid rgba(#000, 0.1);
      border-radius: 5px;
    }
  }
}
</style>
