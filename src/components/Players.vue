<template>
  <div>
    <v-tabs v-model="tab" centered height="30px">
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
                >XP: <b>{{ playerXp }}</b></span
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

          <v-row dense style="overflow-y: auto; max-height: 350px">
            <v-col
              cols="6"
              v-for="(pokemon, idx) in onTeam"
              :key="`team_member${idx}`"
            >
              <v-card
                elevation="3"
                style="height: 155px"
                :color="pokemon.defeated ? '#ff00005c' : 'white'"
                class="pa-2"
              >
                <v-row dense justify="space-around" style="height: 87px">
                  <span style="position: absolute; left: 3px; font-size: 13px"
                    ><b> wins:</b> {{ pokemon.wins || 0 }}</span
                  >
                  <v-col cols="6" class="mt-1" @click="upPokemon(pokemon)">
                    <img
                      height="85px"
                      width="85px"
                      :src="pokemon.sprites.front_default"
                      :class="{ evolving: pokemon.isEvolving }"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    align-self="center"
                    class="pl-2"
                    style="font-size: 12px"
                  >
                    <span class="text-capitalize"
                      ><b>{{ pokemon.name }}</b>
                    </span>
                    <br />
                    <span class="text-capitalize">
                      {{ diceUse(pokemon.base_experience) }}</span
                    >
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col class="pa-0"
                    ><v-chip
                      x-small
                      outlined
                      label
                      class="mt-2 mr-2 overline elevation-3"
                      v-for="(item, idx) in pokemon.types"
                      :key="idx"
                      :color="colors[item.type.name]"
                      >{{ item.type.name }}</v-chip
                    ></v-col
                  >
                </v-row>
                <v-btn icon absolute style="right: 25px; top: 0">
                  <v-icon
                    style="font-size: 8px"
                    @click.stop="changePokemonStatus(pokemon)"
                    >{{ defeatedIcon }}</v-icon
                  >
                </v-btn>
                <v-btn icon absolute style="right: 0px; top: 0">
                  <v-icon
                    style="font-size: 8px"
                    @click.stop="moveTeam(pokemon, false)"
                    >{{ closeIcon }}</v-icon
                  >
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <v-card-title class="py-1">Box</v-card-title>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="(item, i) in activePlayer.pokemons.filter(
                    (p) => !p.onTeam
                  )"
                  :key="`${item} - ${i}`"
                  @dblclick="removePokemon(item)"
                >
                  <td @click="moveTeam(item)">
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
                  <td>
                    <span>{{ diceUse(item.base_experience) }}</span>
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
  </div>
</template>

<script>
import { mdiClose } from "@mdi/js";
import { mdiEmoticonDeadOutline } from "@mdi/js";
import { mdiBottleTonicPlus } from "@mdi/js";
import Http from "../plugins/http";

import { mapActions, mapState } from "vuex";
export default {
  data: () => ({
    closeIcon: mdiClose,
    defeatedIcon: mdiEmoticonDeadOutline,
    potionIcon: mdiBottleTonicPlus,
    tab: 0,
    addMenu: false,
    pokemons: [],
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
    playerXp() {
      return this.activePlayer.pokemons.reduce(
        (acc, el) => (acc += el.base_experience),
        0
      );
    },
    ...mapState([
      "activeFighter",
      "types",
      "savedPlayers",
      "pokemonToTeam",
      "players",
    ]),
    onTeam() {
      return this.activePlayer.pokemons.filter((p) => p.onTeam);
    },
  },
  watch: {
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
    moveTeam(pk, add = true) {
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
    saveProgress(progressName = "slot-1") {
      console.log("salvando...", progressName);
      // this.SAVE_GAME({ progressName, players: this.players });
    },
    load() {
      // if (this.savedPlayers.length) {
      //   const idx = this.savedPlayers.findIndex((s) => s.progressName === slot);
      //   if (idx >= 0) {
      //     this.players = this.savedPlayers[idx].players;
      //   }
      // }
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
        diceType = "d12";
      }
      return diceType;
    },

    sortInitials() {
      let starters = [
        [
          "charmander",
          "cyndaquil",
          "torchic",
          "chimchar",
          "fennekin",
          "litten",
          "scorbunny",
        ],

        [
          "squirtle",
          "totodile",
          "mudkip",
          "piplup",
          "froakie",
          "popplio",
          "sobble",
        ],
        [
          "bulbasaur",
          "chikorita",
          "treecko",
          "turtwig",
          "chespin",
          "rowlet",
          "grookey",
        ],
      ];

      this.players.forEach((p, idx, arr) => {
        const p1 = starters[0][Math.floor(Math.random() * starters[0].length)];
        starters[0] = starters[0].filter((p) => p !== p1);
        const p2 = starters[1][Math.floor(Math.random() * starters[1].length)];
        starters[1] = starters[1].filter((p) => p !== p2);
        const p3 = starters[2][Math.floor(Math.random() * starters[2].length)];

        const sorted = [p1, p2, p3];
        const promisses = [];
        sorted.forEach((poke) => {
          promisses.push(Http.get(`pokemon/${poke}`));
        });

        Promise.allSettled(promisses)
          .then((resp) => {
            return resp.map((r) => {
              const pk = r.value.data;
              pk["onTeam"] = true;
              return pk;
            });
          })
          .then((pokes) => {
            p.pokemons = pokes;
            return p;
          })
          .then(() => {
            if (idx === arr.length - 1) {
              this.SET_PLAYERS(arr);
            }
          });
      });
    },
    defeatPokemon(pokemon) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === pokemon
      );
      let item = this.activePlayer.pokemons[idx];
      this.changePokemonStatus(item);
    },
    changePokemonStatus(item, cure) {
      item.defeated = cure ? false : !item.defeated;
      this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon: item });
    },
    winBattle(pokemon) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === pokemon
      );
      let item = this.activePlayer.pokemons[idx];
      this.upPokemon(item);
    },
    upPokemon(pokemon) {
      if (pokemon.isEvolving || pokemon.defeated) return;
      pokemon.wins = pokemon.wins ? pokemon.wins + 1 : 1;
      this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon });
      if (pokemon.wins == 10 || pokemon.wins == 20) {
        console.log(pokemon);
        this.evolvePokemon(pokemon);
      }
    },
    setEvolveEffect(pokemon, evolving) {
      pokemon["isEvolving"] = evolving;
      this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon });
    },
    evolvePokemon(pokemon) {
      if (pokemon.name === "eevee") return;
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === pokemon.name
      );

      this.setEvolveEffect(idx, pokemon, true);

      try {
        Http.get(`/pokemon-species/${pokemon.name}`)
          .then((resp) => {
            return resp.data.evolution_chain;
          })
          .then((data) => {
            Http.get(data.url)
              .then((resp) => {
                console.log(resp.data);
                return resp.data.chain;
              })
              .then((chain) => {
                console.log(chain.evolution_details);
                if (chain.evolves_to.length) {
                  let evol = chain.evolves_to[0];

                  if (
                    evol.species.name === pokemon.name &&
                    evol.evolves_to.length
                  ) {
                    evol = evol.evolves_to[0];
                  }
                  console.log("d", evol.evolution_details);
                  Http.get(evol.species.url).then((resp) => {
                    Http.get(`pokemon/${resp.data.name}`)
                      .then((resp) => {
                        this.replaceEvoluted(resp.data, idx, pokemon);
                      })
                      .finally(() => (this.isEvolving = false));
                  });
                }
              });
          });
      } catch (error) {
        this.setEvolveEffect(idx, pokemon, false);
      }
    },
    replaceEvoluted(pokemon, idx, oldPokemon) {
      pokemon["onTeam"] = oldPokemon.onTeam;
      pokemon["wins"] = oldPokemon.wins;
      pokemon["defeated"] = oldPokemon.defeated;
      this.UPDATE_PLAYER({ idx, poke: pokemon, playerIdx: this.tab });
    },
    openAddModal() {
      this.addMenu = !this.addMenu;
    },
    closeAndAdd(name) {
      this.addMenu = false;
      Http.get(`pokemon/${name}`).then((resp) => {
        const poke = resp.data;
        delete poke.abilities;
        delete poke.forms;
        delete poke.species;
        delete poke.stats;
        delete poke.moves;
        this.ADD_POKE_TO_PLAYER({ poke, playerIdx: this.tab });
      });
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
::v-deep .v-data-table__wrapper {
  height: 147px;
  overflow-y: auto;
  overflow-x: hidden;
}

.evolving {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  10% {
    opacity: 0.8;
  }

  30% {
    opacity: 0.7;
  }

  60% {
    opacity: 0.6;
  }

  80% {
    opacity: 0.4;
  }

  90% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.1;
  }
}
</style>
