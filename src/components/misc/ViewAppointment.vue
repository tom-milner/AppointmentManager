<template>
  <!-- Modal -->
  <Modal canPrint v-on:close-modal="emitClose">
    <AppointmentFull
      :isCounsellor="isUserCounsellor"
      :appointment="appointment"
      v-on:appointment-deleted="toggleModal()"
    ></AppointmentFull>
  </Modal>
</template>

<script>
import AppointmentFull from "@/components/pages/HomePage/AppointmentFull.vue";
import Modal from "@/components/layout/Modal";
export default {
  components: {
    AppointmentFull,
    Modal
  },
  data() {
    return {};
  },
  methods: {
    emitClose() {
      this.$emit("close-modal");
    }
  },
  props: {
    appointment: {},
    isUserCounsellor: Boolean
  }
};
</script>