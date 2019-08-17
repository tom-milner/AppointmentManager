
<template>
  <div class="btn-group" v-on-clickaway="updateOption">
    <div @click="toggleMenu()">
      <div class="dropdown-toggle">
        <span v-if="selectedOption[dropdownKey] !== undefined">{{ selectedOption[dropdownKey] }}</span>
        <span v-if="selectedOption[dropdownKey] === undefined">{{placeholderText}}</span>
        <span class="caret"></span>
      </div>
    </div>
    <ul class="dropdown-menu" v-if="showMenu && options.length>0">
      <li v-for="option in options" v-bind:key="option[dropdownKey]">
        <a href="javascript:void(0)" @click="updateOption(option)">{{ option[dropdownKey] }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
  mixins: [clickaway],
  data() {
    return {
      selectedOption: {},
      showMenu: false,
      placeholderText: "Please select an item"
    };
  },
  props: {
    options: {
      type: [Array, Object]
    },
    selected: {},
    placeholder: [String],
    dropdownKey: String
  },
  mounted() {
    this.selectedOption = this.selected;
    if (this.placeholder) {
      this.placeholderText = this.placeholder;
    }
  },
  methods: {
    updateOption(option) {
      this.selectedOption = option;
      this.showMenu = false;
      this.$emit("updateOption", this.selectedOption);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
      console.log(this.showMenu);
    }
  }
};
</script>

<style lang="scss" scoped >
@import "src/scss/global";

.btn-group {
  width: 100%;
  border-radius: $border-radius;
  text-decoration: none;
  outline: none;
  border: 1px solid $color-grey-light;
  padding: 0.5rem 0.75rem;
  height: 3rem;
  font-family: $font-family;
  transition: all 0.2s;
  font-size: 1.2rem;
  position: relative;
}
.btn-group:hover {
  text-decoration: none;
  color: $color-primary;
  cursor: pointer;

  .caret {
    border-top-color: $color-primary;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  float: left;
  min-width: 160px;
  padding: 5px 0;
  margin: 2px 0 0;
  list-style: none;
  font-size: 14px;
  text-align: left;
  background-color: $color-white;
  border-radius: 4px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  background-clip: padding-box;
}
.dropdown-menu > li > a {
  padding: 10px 30px;
  display: block;
  clear: both;
  font-weight: normal;
  line-height: 1.6;
  color: $color-black;
  white-space: nowrap;
  text-decoration: none;
}
.dropdown-menu > li > a:hover {
  background: $color-grey-light;
  color: $color-primary;
}

.dropdown-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

$caret-size: 0.8rem;
.caret {
  border-top: $caret-size dashed $color-grey;
  border-top: $caret-size solid \9;
  border-right: $caret-size solid transparent;
  border-left: $caret-size solid transparent;
}
li {
  list-style: none;
}
</style>