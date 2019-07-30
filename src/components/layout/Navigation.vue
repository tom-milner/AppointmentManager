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
          <router-link to="/home" class="nav-item">
            <unicon name="home-alt" class="icon-nav-item" />
          </router-link>
        </li>
        <li>
          <router-link to="/planner" class="nav-item">
            <unicon name="user" class="icon-nav-item" />
          </router-link>
        </li>
        <li>
          <router-link to="/calendar" class="nav-item">
            <unicon name="calender" class="icon-nav-item"></unicon>
          </router-link>
        </li>
      </ul>
      <div class="logout-button-box" @click="logout">
        <unicon name="exit" class="logout-button"></unicon>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
export default {
  components: {},

  data() {
    return {};
  },

  methods: {
    logout: async function() {
      UserService.logoutUser();
      this.$router.push("/");
    }
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
      padding: 0;

      .nav-item {
        position: relative;
        display: block;
        padding: 10px 0;

        & .icon-nav-item {
          fill: $color-inactive;
          transition: all 0.2s ease-in-out;
          height: $icon-height;
          width: $icon-width;
        }

        &:hover .icon-nav-item,
        &.router-link-active .icon-nav-item {
          fill: $color-primary;
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
      fill: $color-error;
    }

    .logout-button {
      transition: all 0.2s ease-in-out;
      fill: $color-inactive;
      height: $icon-height * 1.2;
      width: $icon-width * 1.2;
    }
  }
}
</style>
