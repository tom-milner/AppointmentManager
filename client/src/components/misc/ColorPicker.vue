<template>
  <div class="wrapper">
    <div
      class="color-box"
      @click="setColor(color)"
      :style="getColorStyle(color)"
      v-for="color in colors"
      :key="color"
    ></div>
  </div>
</template>


<script>
export default {
  props: {
    colors: Array
  },
  data() {
    return {
      chosenColor: ""
    };
  },
  methods: {
    setColor(color) {
      this.chosenColor = color;
      this.$emit("input", color);
    },
    getColorStyle(color) {
      let styleObject = {
        "background-color": color
        // : `2px solid black`
      };

      if (this.chosenColor == color) {
        styleObject.width = "4rem";
        styleObject.height = "4rem";

        // styleObject["border-radius"] = "50px";
      }

      return styleObject;
    }
  },
  mounted() {
    this.chosenColor = this.$attrs.value;
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
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