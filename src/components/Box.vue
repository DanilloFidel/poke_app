<template>
  <v-expansion-panels>
    <v-expansion-panel
      v-for="(item, i) in activePlayer.pokemons"
      :key="`${item} - ${i}`"
    >
      <v-expansion-panel-header>
        <span
          style="text-transform: capitalize; font-weight: bold"
          :style="{ color: item.onTeam ? 'red' : null }"
          >{{ item.name }}</span
        >

        <span
          class="mr-1 overline"
          v-for="(item_2, idx) in item.types"
          :key="idx"
          :style="{
            color: `${colors[item_2.type.name]}`,
          }"
          >{{ item_2.type.name }}</span
        ></v-expansion-panel-header
      >
      <v-expansion-panel-content>
        <span class="mr-1"> HP: {{ item.stats[0].base_stat }} </span>
        <span class="mr-1">
          ATK:
          {{ item.stats[1].base_stat }}
        </span>
        <span class="mr-1"> DEF: {{ item.stats[2].base_stat }} </span>

        <v-btn x-small icon @click="removePokemon(item)"
          ><v-icon>{{ closeIcon }}</v-icon></v-btn
        >
        <v-btn x-small class="mx-2" @click="movePokemon(item)">party</v-btn>
        <img :src="item.sprites.front_default" width="100px" height="100px" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
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
        poke = { ...pk, onTeam: false, isEvolving: false };
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