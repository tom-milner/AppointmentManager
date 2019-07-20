<template>
  <Card>
    <a @click="logout">Logout</a>
  </Card>
</template>

<script>
import Card from "@/components/layout/Card.vue";

export default {
  components: {
    Card
  },

  methods: {
    logout: async function() {
      await this.$store.dispatch("authentication/logout");
      this.$router.push("/");
    }
  },
  data() {
    return {};
  },
  computed: {}
};
</script>

<style>
</style>
