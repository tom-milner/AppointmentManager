<template>
  <div>
    <div class="sidebar-wrapper">
      <ul class="navigation">
        <li>
          <router-link to="/profile" class="nav-item">
            <div
              v-bind:style="{ backgroundImage: 'url(' + /*profileImage*/ 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' + ')' }"
              class="profile-image"
            ></div>
          </router-link>
        </li>
        <li>
          <!-- TODO: create list of icons in js, then render them. -->
          <router-link to="/home" class="nav-item">
            <icon name="home" class="icon-nav-item" />
          </router-link>
        </li>

        <li>
          <router-link to="/create" class="nav-item">
            <icon name="plus-square" class="icon-nav-item" />
          </router-link>
        </li>

        <div v-if="userIsCounsellor ">
          <li>
            <router-link to="/counsellor/calendar" class="nav-item">
              <icon name="clock" class="icon-nav-item" />
            </router-link>
          </li>
          <li>
            <router-link to="/counsellor/appointment-settings" class="nav-item">
              <icon name="settings" class="icon-nav-item" />
            </router-link>
          </li>
          <li>
            <router-link to="/counsellor/clients" class="nav-item">
              <icon name="users" class="icon-nav-item" />
            </router-link>
          </li>
        </div>
      </ul>
      <div class="logout-button-box" @click="logout">
        <icon name="log-out" class="logout-button"></icon>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
import Icon from "vue-icon/lib/vue-feather.esm";

export default {
  components: {
    Icon
  },

  data() {
    return {
      user: {}
    };
  },

  methods: {
    logout: async function() {
      UserService.logoutUser();
      this.$router.push("/");
    }
  },

  computed: {
    userIsCounsellor: function() {
      return this.$store.getters["authentication/isCounsellor"];
    }
  },

  mounted() {
    // get user from the store
    this.user = this.$store.state.authentication.user;
  }
};
</script>

<style lang="scss" scoped>
@import "../../scss/global.scss";

$icon-width: 2.5rem;
$icon-height: $icon-width;

.sidebar-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  // text-align: center;
  top: 0;
  left: 0;
  bottom: 0;
  height: 100%;
  z-index: 1;
  width: $nav-width;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  background-color: $color-grey-light;

  .navigation {
    .profile-image {
      display: inline-block;
      height: 50px;
      width: 50px;
      background-size: 130%;
      background-position: top;
      border-radius: 100%;
    }

    li {
      display: block;
      text-align: center;
      margin: 20px 0;

      .nav-item {
        position: relative;
        display: block;
        padding: 1rem 0;

        & .icon-nav-item {
          color: $color-inactive;
          transition: all 0.2s ease-in-out;
          height: $icon-height;
          width: $icon-width;
        }

        &:hover .icon-nav-item,
        &:active,
        &.router-link-active .icon-nav-item {
          color: $color-primary;
        }

        &::before {
          content: "";
          display: block;

          position: absolute;
          top: 0;
          border-top-right-radius: 100px;
          border-bottom-right-radius: 100px;

          background-color: $color-primary;
          height: 100%;
          width: 0px;

          transition: all 0.2s;
        }

        &.router-link-active::before {
          width: 4px;
        }
      }
    }
  }
  .logout-button-box {
    width: 100%;
    text-align: center;
    margin-bottom: 2rem;
    &:hover .logout-button {
      color: $color-error;
    }

    .logout-button {
      transition: all 0.2s ease-in-out;
      color: $color-inactive;
      height: $icon-height * 1.2;
      width: $icon-width * 1.2;
    }
  }
}
</style>
