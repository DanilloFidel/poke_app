<template>
  <v-container>
    <v-simple-table fixed-header style="max-height: 84vh; overflow-y: auto">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Nome</th>
            <th class="text-left">Qtd</th>
            <th class="text-left">Descartar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in activePlayer.bag" :key="`${item} - ${i}`">
            <td>
              {{ item.name }}
            </td>

            <td>
              <span>{{ item.amount }}</span>
            </td>

            <td>
              <v-btn
                x-small
                color="red"
                :disabled="!!item.captureBonus"
                @click="removeItem(item)"
                >-</v-btn
              >
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  data: () => ({}),
  created() {
    // console.log(this.shopItems);
  },
  props: ["tab"],
  computed: {
    ...mapState(["pokeballTypes", "activePlayer"]),
  },
  methods: {
    ...mapActions(["UPDATE_PLAYER_ATTR"]),
    removeItem(item) {
      const idx = this.activePlayer.bag.findIndex((x) => x.name === item.name);
      if (idx < 0) {
        return;
      } else {
        let itemOn = this.activePlayer.bag[idx];
        itemOn.amount -= 1;
      }

      this.UPDATE_PLAYER_ATTR({ player: this.activePlayer, idx: this.tab });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .v-data-table__wrapper {
  max-height: 75vh;
}
</style>