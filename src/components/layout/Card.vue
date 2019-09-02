<template>
  <div class="card">
    <div v-if="showBack" v-on:click="goBack" class="icon-box">
      <icon name="arrow-left"></icon>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import Icon from "vue-icon/lib/vue-feather.esm";

export default {
  components: {
    Icon
  },
  methods: {
    goBack: function() {
      if (this.backUrl) this.$router.push(this.backUrl);
      else this.$router.go(-1);
    }
  },
  props: {
    showBack: Boolean,
    backUrl: String
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.card {
  position: relative;
}

.content {
  padding: 4rem;
  border-radius: $border-radius;
  background-color: $color-white;
  box-shadow: -1px 2px 3px rgba($color-black, 0.2);
}

.icon-box {
  position: absolute;
  float: left;
  top: 0;
  left: 0;
  color: $color-black;
  padding: 1.5rem;

  .icon {
    height: 2rem;
  }
  font-size: 1rem;
}
</style>
