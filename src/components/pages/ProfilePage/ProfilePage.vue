<template>
  <div class="wrapper">
    <h2 class="heading-2">Your Profile</h2>
    <!-- For Counsellors Only -->
    <!-- Booking Link -->
    <div v-if="userIsCounsellor" class="container">
      <h3 class="heading-3">Your Booking Link</h3>
      <p class="paragraph">
        <span>Note:</span> Click to copy.
      </p>
      <h4 @click="copyToClipboard" class="heading-4 booking-link">{{generateBookingLink()}}</h4>
      <h4 class="heading-4 success copy-message">Link Copied!</h4>
    </div>
  </div>
</template>

<script>
import Utils from "@/utils";
export default {
  data() {
    return {
      user: {}
    };
  },
  beforeMount() {
    this.user = this.$store.state.authentication.user;
  },
  mounted() {
    document.querySelector(".copy-message").style.animation = "none";
  },
  computed: {
    userIsCounsellor: function() {
      return this.$store.getters["authentication/isCounsellor"];
    }
  },
  methods: {
    generateBookingLink() {
      return `${window.location.origin}/auth/guest/${this.user._id}`;
    },
    copyToClipboard(event) {
      let link = event.target.innerText;
      console.log(link);

      this.linkCopied = Utils.copyToClipboard(link, document);

      let copyMessage = document.querySelector(".copy-message");

      copyMessage.style.animation = "none";
      copyMessage.offsetHeight;
      copyMessage.style.animation = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/scss/global";

.container {
  margin-top: 2rem;

  .copy-message {
    display: inline-block;
    margin-left: 1rem;
    transition: all 0.2s;
    opacity: 0;
    animation: 1s fadeOut ease-out;
    transform: translateY(0);
  }
  .booking-link {
    margin-top: 1rem;
    background-color: $color-canvas;
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    transition: all 0.2s;

    &:hover {
      background-color: darken($color-canvas, 10%);
    }
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  70% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    display: none;
    transform: translateY(-0.5rem);
  }
}
</style>