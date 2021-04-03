<template>
  <v-row dense class="ma-4">
    <v-col cols="8"><v-btn @click="$emit('new-game')">Novo jogo</v-btn></v-col>
  </v-row>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "DataSetup",
  data: () => ({
    slot: "slot-1",
    slots: ["slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6"],
  }),
  computed: {
    ...mapState(["savedPlayers"]),
  },
  methods: {
    load(name) {
      this.$emit("load-slot", name);
      this.$emit("update-slot", name);
    },
  },
};
</script>

<style>
</style>