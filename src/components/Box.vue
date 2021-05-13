<template>
  <div class="box elevation-5">
    <img
    :style="{ border: item.onTeam ? '1px solid #eaeaf7' : null }"
      v-for="(item, i) in activePlayer.pokemons"
      :key="`${item} - ${i}`"
      :src="item.sprites.front_default"
      @click="setMouse($event, item)"
      :alt="item.name"
      width="100px"
      height="100px"
      style="
        -webkit-filter: drop-shadow(3px 3px 3px #222);
        filter: drop-shadow(3px 3px 3px #222);
      "
    />
    <v-menu
    v-if="item.name"
      v-model="menu"
      :close-on-content-click="false"
      :position-x="100"
      :position-y="y"
    >
      <v-card class="pa-3">
        <span
          style="text-transform: capitalize; font-weight: bold"
          :style="{ color: item.onTeam ? 'red' : null }"
          >{{ item.name }}</span
        >
        <br>
        <span
          class="mr-1 overline"
          v-for="(item_2, idx) in item.types"
          :key="idx"
          :style="{
            color: `${colors[item_2.type.name]}`,
          }"
          >{{ item_2.type.name }}</span
        >
        <br>
        <span class="mr-1"> HP: {{ item.stats[0].base_stat }} </span>
        <span class="mr-1">
          ATK:
          {{ item.stats[1].base_stat }}
        </span>
        <span class="mr-1"> DEF: {{ item.stats[2].base_stat }} </span>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text
            @click="
              removePokemon(item);
              menu = false;
            "
          >
            Excluir
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="
              movePokemon(item);
        
            "
          >
            Party
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mdiClose } from "@mdi/js";
import { mapActions } from "vuex";
export default {
  data: () => ({
    closeIcon: mdiClose,
    menu: false,
    x: 0,
    y: 0,
    item: {},
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
    setMouse(e, item) {
      this.x = e.clientX;
      this.y = e.clientY;
      this.item = item
      this.menu = true;
    },
  },
};
</script>

<style scoped>
.box {
  overflow: auto;
  height: calc(100vh - 120px);
  width: 100vw;
  background-color: #ecf3f5;
  margin: 3% 5%;
  border: 2px solid;
}
</style>