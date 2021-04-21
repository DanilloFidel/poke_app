<template>
  <v-simple-table fixed-header style="max-height: 84vh; overflow-y: auto">
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">Nome</th>
          <th class="text-left">Tipo</th>
          <th class="text-left">HP</th>
          <th class="text-left">Ataque</th>
          <th class="text-left">Defesa</th>
          <th class="text-left"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in activePlayer.pokemons" :key="`${item} - ${i}`">
          <td
            @click="movePokemon(item)"
            style="text-transform: capitalize; font-weight: bold"
            :style="{ backgroundColor: item.onTeam ? '#ff00004a' : null }"
          >
            {{ item.name }}
          </td>
          <td>
            <span
              class="mr-1 overline"
              v-for="(item_2, idx) in item.types"
              :key="idx"
              :style="{
                color: `${colors[item_2.type.name]}`,
              }"
              >{{ item_2.type.name }}</span
            >
          </td>
          <td @click="movePokemon(item)">
            {{ item.stats[0].base_stat }}
          </td>
          <td>
            {{ item.stats[1].base_stat }}
          </td>
          <td>
            {{ item.stats[2].base_stat }}
          </td>
          <td>
            <v-btn x-small icon @click="removePokemon(item)"
              ><v-icon>{{ closeIcon }}</v-icon></v-btn
            >
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import { mdiClose } from "@mdi/js";
import { mapActions } from "vuex";
export default {
  data: () => ({
    closeIcon: mdiClose,
  }),
  props: ["activePlayer", "colors", "tab"],
  methods: {
    ...mapActions([
      "SAVE_GAME",
      "UPDATE_PLAYER",
      "SET_PLAYERS",
      "REMOVE_PLAYERS_POKE",
      "ADD_POKE_TO_PLAYER",
    ]),
    removePokemon(item) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      );
      this.REMOVE_PLAYERS_POKE({ idx, playerIdx: this.tab });
    },
    movePokemon(pk) {
      const add = !pk.onTeam;
      const teamLength = this.activePlayer.pokemons.filter((p) => p.onTeam)
        .length;
      const canAdd = teamLength < 6;
      let poke = {};
      if (!add) {
        poke = { ...pk, onTeam: false };
      } else {
        poke = { ...pk, onTeam: canAdd ? !pk["onTeam"] : false };
      }
      this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon: poke });
    },
  },
};
</script>

<style>
</style>