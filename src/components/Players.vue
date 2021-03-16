<template>
  <div>
    <v-tabs v-model="tab" centered>
      <v-tabs-slider></v-tabs-slider>

      <v-tab v-for="(player, idx) in players" :key="`player${idx}`">
        {{ player.name }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="(player, idx) in players"
        :key="`player_content${idx}`"
      >
        <v-card class="pa-3">
          <v-row>
            <v-col>
              <span
                >XP: <b>{{ activePlayer.xp }}</b></span
              >
            </v-col>
            <v-col>
              <v-btn x-small @click="openAddModal">Adicionar Pokemon</v-btn>
            </v-col>
            <v-col>
              <v-btn x-small icon @click="cureAll"
                ><v-icon>{{ potionIcon }}</v-icon></v-btn
              >
            </v-col>
          </v-row>

          <v-row dense>
            <v-col
              cols="6"
              v-for="(pokemon, idx) in onTeam"
              :key="`team_member${idx}`"
            >
              <v-card
                elevation="3"
                style="height: 128px"
                :color="pokemon.defeated ? '#ff00005c' : 'white'"
                class="pa-2"
              >
                <v-row dense justify="space-around">
                  <v-col cols="4">
                    <img
                      height="65px"
                      width="65px"
                      :src="pokemon.sprites.front_default"
                    />
                  </v-col>
                  <v-col cols="8" align-self="center" class="pl-2">
                    <span class="text-capitalize"
                      ><b>{{ pokemon.name }}</b>
                    </span>
                    <br />
                    <span class="text-capitalize">
                      {{ diceUse(pokemon.base_experience) }}</span
                    >
                    <br />
                    <v-chip
                      small
                      outlined
                      label
                      class="mt-2 mr-2 overline elevation-3"
                      v-for="(item, idx) in pokemon.types"
                      :key="idx"
                      :color="colors[item.type.name]"
                      >{{ item.type.name }}</v-chip
                    >
                  </v-col>
                </v-row>
                <v-btn icon absolute style="right: -6px; top: 0">
                  <v-icon @click="changePokemonStatus(pokemon)">{{
                    defeatedIcon
                  }}</v-icon>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <v-card-title class="py-1">Box</v-card-title>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="(item, i) in activePlayer.pokemons"
                  :key="`${item} - ${i}`"
                  @dblclick="removePokemon(item)"
                >
                  <td @click="addOnTeam(item, i)">
                    <img
                      v-if="item.onTeam"
                      width="10px"
                      height="10px"
                      src="../assets/pokeball.svg"
                    />
                    {{ item.name }}
                  </td>
                  <td>
                    <span
                      @click="openTypesModal(item.types)"
                      class="mr-1 overline"
                      v-for="(item_2, idx) in item.types"
                      :key="idx"
                      :style="{
                        color: `${colors[item_2.type.name]}`,
                      }"
                      >{{ item_2.type.name }}</span
                    >
                  </td>
                  <td>
                    <span>{{ diceUse(item.base_experience) }}</span>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="addMenu">
      <v-card class="pa-3">
        <v-row dense>
          <v-autocomplete
            label="Nome"
            :items="pokemons"
            item-text="name"
            item-value="name"
            @change="closeAndAdd"
          ></v-autocomplete>
        </v-row>
      </v-card>
    </v-dialog>

    <v-dialog v-model="typesDialog">
      <v-card class="pa-3">
        <v-row dense>
          <span>Inimigo</span>
          <v-chip
            small
            x-small
            pill
            outlined
            class="ml-3 overline elevation-3"
            v-for="(item_2, idx) in enemyTypes"
            :key="idx"
            :color="colors[item_2.name]"
            >{{ item_2.name }}</v-chip
          >
        </v-row>
        <v-row dense class="mt-5">
          <span>Jogador</span>
          <v-chip
            small
            x-small
            pill
            outlined
            :style="{
              opacity: item_2.lose ? 0.3 : 1,
            }"
            class="ml-3 overline elevation-3"
            v-for="(item_2, idx) in playerTypes"
            :key="idx"
            :color="colors[item_2.type.name]"
            >{{ item_2.type.name }}</v-chip
          >
        </v-row>
      </v-card>
    </v-dialog>

    <v-btn absolute bottom right x-small @click="saveProgress"
      >Salvar partida</v-btn
    >
  </div>
</template>

<script>
import { mdiClose } from "@mdi/js";
import { mdiEmoticonDeadOutline } from "@mdi/js";
import { mdiBottleTonicPlus } from "@mdi/js";
import Http from "../plugins/http";

import Vue from "vue";
import { mapActions, mapState } from "vuex";
export default {
  data: () => ({
    typesDialog: false,
    closeIcon: mdiClose,
    enemyTypes: [],
    playerTypes: [],
    defeatedIcon: mdiEmoticonDeadOutline,
    potionIcon: mdiBottleTonicPlus,
    tab: 0,
    addMenu: false,
    pokemons: [],
    players: [
      {
        name: "Danillo",
        xp: 0,
        pokemons: [],
      },
      {
        name: "Eduardo",
        xp: 0,
        pokemons: [],
      },
    ],
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Pokemons",
        align: "start",
        sortable: false,
        value: "name",
      },
      { text: "Tipo", value: "type" },
    ],
  }),
  computed: {
    activePlayer() {
      return this.players[this.tab];
    },
    ...mapState([
      "activeFighter",
      "types",
      "savedPlayers",
      "applyXp",
      "pokemonToTeam",
    ]),
    onTeam() {
      return this.activePlayer.pokemons.filter((p) => p.onTeam);
    },
  },
  watch: {
    applyXp(obj) {
      obj.val && this.setXp(obj.val, obj.win);
    },
    pokemonToTeam(obj) {
      obj.name && this.activePlayer.pokemons.push(obj);
    },
  },
  props: ["colors"],
  created() {
    Http.get("pokemon?limit=1118").then(
      (resp) => (this.pokemons = resp.data.results)
    );
  },
  methods: {
    ...mapActions(["SET_PLAYERS"]),
    removePokemon(item) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      );
      this.setXp(item.base_experience, false);
      Vue.delete(this.activePlayer.pokemons, idx);
    },
    addOnTeam(pk, idx) {
      const teamLength = this.activePlayer.pokemons.filter((p) => p.onTeam)
        .length;
      const canAdd = teamLength < 6;
      const poke = { ...pk, onTeam: canAdd ? !pk["onTeam"] : false };
      Vue.set(this.activePlayer.pokemons, idx, poke);
    },
    saveProgress() {
      this.SET_PLAYERS(this.players);
    },
    load() {
      if (this.savedPlayers.length) this.players = [...this.savedPlayers];
    },
    diceUse(xp) {
      let diceType = "d6";
      if (xp >= 120) {
        diceType = "d8";
      }
      if (xp >= 170) {
        diceType = "d10";
      }
      if (xp >= 200) {
        diceType = "d20";
      }
      return diceType;
    },
    openTypesModal(types) {
      if (!this.activeFighter.name) return;
      const enemyTypes = this.activeFighter.activePokemon.types.map(
        (t) => t.type.name
      );
      const typesInfo = this.types.filter((t) => enemyTypes.includes(t.name));
      if (typesInfo.length) {
        typesInfo.forEach((type) => {
          const win = type.damage_relations.double_damage_to.map((x) => x.name);
          const lose = type.damage_relations.double_damage_from.map(
            (x) => x.name
          );

          types.forEach((playerT) => {
            const name = playerT.type.name;
            if (win.includes(name)) {
              playerT.lose = true;
            }
            if (lose.includes(name)) {
              playerT.win = true;
            }
          });
        });
        this.enemyTypes = typesInfo;
        this.playerTypes = types;
        console.log(this.playerTypes);
      }
      this.typesDialog = !this.typesDialog;
    },
    sortInitials() {
      this.players = [];
      this.players = [
        {
          name: "Danillo",
          xp: 0,
          pokemons: [],
        },
        {
          name: "Eduardo",
          xp: 0,
          pokemons: [],
        },
      ];
    },
    changePokemonStatus(item, cure) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      );
      item.defeated = cure ? false : !item.defeated;
      Vue.set(this.activePlayer.pokemons, idx, item);
    },
    openAddModal() {
      this.addMenu = !this.addMenu;
    },
    closeAndAdd(name) {
      this.addMenu = false;
      Http.get(`pokemon/${name}`).then((resp) => {
        this.activePlayer.pokemons.push(resp.data);
        this.setXp(resp.data.base_experience, true);
      });
    },
    setXp(xp, add) {
      const p = {
        ...this.activePlayer,
        xp: add ? this.activePlayer.xp + xp : this.activePlayer.xp - xp,
      };
      Vue.set(this.players, this.tab, p);
    },
    cureAll() {
      this.activePlayer.pokemons.forEach((p) => {
        this.changePokemonStatus(p, true);
      });
    },
  },
};
</script>

<style scoped>
::v-deep .v-data-table {
  height: 188px;
  overflow-y: auto;
}
</style>
