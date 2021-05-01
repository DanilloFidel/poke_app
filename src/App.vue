<template>
  <v-app>
    <v-container fluid class="pa-0 main">
      <v-tabs v-model="tab" centered height="30px" @change="setActivePlayer">
        <!-- <v-tabs-slider></v-tabs-slider> -->

        <v-tab v-for="(player, idx) in players" :key="`player${idx}`">
          {{ player.name }}
        </v-tab>
        <v-btn x-small icon @click="newGame" color="red">x</v-btn>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item
          v-for="(player, idx) in players"
          :key="`player_content${idx}`"
        >
          <v-row dense class="mt-3 mx-3">
            <v-col>
              <span
                >XP: <b>{{ playerXp }}</b></span
              >
              <br />
              <span
                >$$: <b>{{ player.money }}</b></span
              >
            </v-col>
            <v-col>
              <v-btn x-small @click="openAddModal">+</v-btn>
            </v-col>
            <v-col>
              <v-btn x-small @click="sortPlayerTurn">sortear</v-btn>
            </v-col>
            <v-col>
              <v-btn x-small @click="screen = 'home'">Home</v-btn>
            </v-col>
          </v-row>

          <v-row
            dense
            style="overflow-y: auto; max-height: 350px"
            class="mx-3"
            v-if="screen === 'home'"
          >
            <v-col
              cols="6"
              v-for="(pokemon, idx) in onTeam"
              :key="`team_member${idx}`"
            >
              <v-card
                elevation="3"
                style="height: 100px"
                :color="pokemon.isDefeated ? '#ff00005c' : 'white'"
                class="pa-2"
              >
                <v-row dense justify="space-around" style="height: 100px">
                  <span style="position: absolute; left: 3px; font-size: 13px"
                    ><b> lvl:</b> {{ pokemon.wins || 0 }}</span
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
                    <v-chip
                      x-small
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
              </v-card>
            </v-col>
          </v-row>

          <v-row
            dense
            justify="center"
            align="center"
            style="height: 200px"
            v-if="screen == 'home'"
          >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="orange" @click="toggleScreen('arena')"
                >Batalha</v-btn
              ></v-col
            >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="green" @click="toggleScreen('capture')"
                >Captura</v-btn
              ></v-col
            >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="grey" @click="toggleScreen('box')"
                >PC Box</v-btn
              ></v-col
            >
            <v-col
              cols="6"
              class="d-flex justify-center"
              @click="toggleScreen('bag')"
              ><v-btn width="120" color="brown">Mochila</v-btn></v-col
            >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="blue" @click="toggleScreen('shop')"
                >Loja</v-btn
              ></v-col
            >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="red">Pokedex</v-btn></v-col
            >
            <v-col cols="6" class="d-flex justify-center"
              ><v-btn width="120" color="#b482ff" @click="CURE_ALL"
                >Curar Todos</v-btn
              ></v-col
            >
          </v-row>
          <v-row dense justify="center" align="center" v-if="screen == 'box'">
            <box :activePlayer="activePlayer" :colors="colors" :tab="tab"></box>
          </v-row>
          <v-row dense justify="center" align="center" v-if="screen == 'bag'">
            <bag :activePlayer="activePlayer" :colors="colors" :tab="tab"></bag>
          </v-row>
          <v-row dense justify="center" align="center" v-if="screen == 'shop'">
            <shop
              :activePlayer="activePlayer"
              :colors="colors"
              :tab="tab"
            ></shop>
          </v-row>
          <v-row dense justify="center" align="center" v-if="screen == 'arena'">
            <arena
              :activePlayer="activePlayer"
              :colors="colors"
              :tab="tab"
            ></arena>
          </v-row>
          <v-row
            dense
            justify="center"
            align="center"
            v-if="screen == 'capture'"
          >
            <poke-encounter
              :activePlayer="activePlayer"
              :colors="colors"
              :tab="tab"
            ></poke-encounter>
          </v-row>
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
    </v-container>
  </v-app>
</template>

<script>
import Http from "./plugins/http";
import Box from "./components/Box";
import Bag from "./components/Bag";
import { mdiCalendarClockOutline } from "@mdi/js";
import { mapActions, mapState } from "vuex";
import PokeEncounter from "./components/PokeEncounter.vue";
import Arena from "./components/Arena.vue";
import Shop from "./components/Shop.vue";
export default {
  name: "App",
  data: () => ({
    battlePokemon: {},
    diceModal: false,
    addMenu: false,

    loadIcon: mdiCalendarClockOutline,
    drawer: true,
    screen: "home",
    fab: false,
    pokemons: [],
    loading: false,
    btnLoading: false,
    slot: "slot-1",
    habitats: [
      {
        name: "random all",
        url: "https://pokeapi.co/api/v2/pokemon?limit=1118",
      },
    ],
    tab: 0,
    selectedPokemon: {},
    selectedHabitat: "",
    diceValue: 1,
    diceValue2: 1,
    simpleChance: true,
    diceType: "single_d6",
    showSecondDice: true,
    colors: {
      poison: "#ab6ac8",
      grass: "#63bb5b",
      ground: "#fdda96",
      fighting: "#ce4069",
      flying: "#8fa8dd",
      rock: "#d1c17d",
      bug: "#90c12c",
      ghost: "#5269ac",
      steel: "#5a8ea1",
      fire: "#db4249",
      water: "#4d90d5",
      electric: "#f3d23b",
      psychic: "#f97176",
      ice: "#6db5ba",
      dragon: "#0a6dc4",
      dark: "#5a5366",
      fairy: "#ec8fe6",
      normal: "#c6c6a7",
    },
  }),

  components: {
    Box,
    PokeEncounter,
    Shop,
    Bag,
    Arena,
  },

  watch: {
    diceModal(val) {
      if (!val) {
        this.SET_DICE_BATTLE();
      }
    },
  },

  computed: {
    ...mapState(["diceBattle", "activePlayer", "activeFighter", "players"]),
    diceImg() {
      return require(`./assets/${this.diceType}.svg`);
    },
    loadingImg() {
      return require("./assets/loading.gif");
    },
    activePlayer() {
      return this.players[this.tab];
    },
    playerXp() {
      return this.activePlayer.pokemons.reduce(
        (acc, el) => (acc += el.base_experience + (el.wins || 0) * 20),
        0
      );
    },
    onTeam() {
      return this.activePlayer.pokemons.filter((p) => p.onTeam);
    },
  },

  created() {
    this.fecthHabitats();
    this.setActivePlayer(0);
    Http.get("pokemon?limit=1118").then(
      (resp) => (this.pokemons = resp.data.results)
    );
    Http.get(`/type`)
      .then((resp) => resp.data.results.map((r) => r))
      .then((types) => {
        const calls = types.map((type) => Http.get(`/type/${type.name}`));
        Promise.all(calls)
          .then((resp) => resp.map((r) => r.data))
          .then((datas) => {
            const types = datas.filter(
              (t) => !["unknown", "shadow"].includes(t.name)
            );
            this.SET_TYPES(types);
          });
      });
    // setInterval(() => {
    //   this.$refs.players.saveProgress(this.slot);
    // }, 10000);
  },

  methods: {
    ...mapActions([
      "SET_DICE_BATTLE",
      "SET_SINGLE_DICE_BATTLE",
      "ADD_POKE_TO_PLAYER",
      "UPDATE_PLAYER",
      "SET_PLAYERS",
      "SET_VALUE_DICE_BATTLE",
      "SET_ACTIVE_PLAYER",
      "SET_TYPES",
      "CURE_ALL",
      "UPDATE_PLAYER_ATTR",
    ]),
    fecthHabitats() {
      this.btnLoading = true;
      fetch("https://pokeapi.co/api/v2/pokemon-habitat")
        .then((resp) => resp.json())
        .then((data) => {
          this.habitats = [...this.habitats, ...data.results];
        })
        .finally(() => (this.btnLoading = false));
    },
    loadProgress(slot) {
      this.$refs.players.load(slot);
    },
    setActivePlayer(e) {
      this.SET_ACTIVE_PLAYER(e);
    },
    toggleScreen(name) {
      this.screen = name;
    },
    openAddModal() {
      this.addMenu = !this.addMenu;
    },
    cureAll() {
      this.activePlayer.pokemons.forEach((p) => {
        this.changePokemonStatus(p, true);
      });
    },
    changeHabitat(url) {
      this.btnLoading = true;
      fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
          this.pokemons = data.pokemon_species
            ? data.pokemon_species
            : data.results;
          this.sortPokemon();
        })
        .finally(() => (this.btnLoading = false));
    },
    newGame() {
      if (confirm("desejar iniciar um novo jogo?")) {
        let starters = [
          [
            "charmander",
            "cyndaquil",
            "torchic",
            "chimchar",
            "fennekin",
            "litten",
            "scorbunny",
            "tepig",
          ],

          [
            "squirtle",
            "totodile",
            "mudkip",
            "piplup",
            "froakie",
            "popplio",
            "oshawott",
            "sobble",
          ],
          [
            "bulbasaur",
            "chikorita",
            "treecko",
            "snivy",
            "turtwig",
            "chespin",
            "rowlet",
            "grookey",
          ],
        ];

        this.players.forEach((p, idx, arr) => {
          const p1 =
            starters[0][Math.floor(Math.random() * starters[0].length)];
          starters[0] = starters[0].filter((p) => p !== p1);
          const p2 =
            starters[1][Math.floor(Math.random() * starters[1].length)];
          starters[1] = starters[1].filter((p) => p !== p2);
          const p3 =
            starters[2][Math.floor(Math.random() * starters[2].length)];

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
      }
    },
    closeAndAdd(name) {
      this.addMenu = false;
      Http.get(`pokemon/${name}`).then((resp) => {
        const poke = resp.data;
        this.ADD_POKE_TO_PLAYER({ poke, playerIdx: this.tab });
      });
    },
    async sortPokemon() {
      this.loading = true;
      const idx = Math.floor(Math.random() * this.pokemons.length);
      const selected = this.pokemons[idx];

      try {
        let pokemonInfo = await fetch(selected.url).then((resp) => resp.json());
        let pokemonInfo2 = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${selected.name}`
        ).then((resp) => resp.json());

        setTimeout(() => {
          this.selectedPokemon = { ...pokemonInfo, ...pokemonInfo2 };
          if (
            this.selectedPokemon.sprites &&
            !this.selectedPokemon.sprites.front_default
          ) {
            this.sortPokemon();
          } else {
            this.setDiceDifficult();
            this.loading = false;
          }
        }, 1500);
      } catch (error) {
        this.loading = false;
        alert("Ocorreu um erro ao carregar o Pokemon");
      }
      // this.searchPokemon(selected.url);
    },
    upPokemon(pokemon) {
      console.log(pokemon);
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

      this.setEvolveEffect(pokemon, true);

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
                        this.replaceEvoluted(resp.data, pokemon);
                      })
                      .finally(() => (this.isEvolving = false));
                  });
                }
              });
          });
      } catch (error) {
        this.setEvolveEffect(pokemon, false);
      }
    },
    sortPlayerTurn() {
      const types = [
        { event: this.sortEnemy },
        { event: this.sortCard },
        { event: this.sortEncounter },
        { event: this.sortNothing },
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      t.event();
    },
    sortEnemy() {
      alert("inimigo");
    },
    sortCard() {
      const cards = require("./data/cards.json").cards;
      const normal = cards.filter((c) => c.type === "Normal");
      const rare = cards.filter((c) => c.type === "Rara");
      const xRare = cards.filter((c) => c.type === "Ultra Rara");

      const chances = {
        normal: 100,
        rare: 40,
        xRare: 10,
      };

      const n = Math.floor(Math.random() * 100) + 1;
      let c = null;
      let x = 0;

      if (n <= chances.xRare) {
        x = Math.floor(Math.random() * xRare.length);
        c = xRare[x];
      }
      if (n >= 11 && n <= chances.rare) {
        x = Math.floor(Math.random() * rare.length);
        c = rare[x];
      }
      if (n >= 41 && n <= chances.normal) {
        x = Math.floor(Math.random() * normal.length);
        c = normal[x];
      }

      if (confirm(c.descr) && c.item) {
        const player = { ...this.activePlayer };
        const idx = player.bag.findIndex((x) => x.name === c.item.name);
        if (idx < 0) {
          player.bag.push(c.item);
        } else {
          let itemOn = player.bag[idx];
          itemOn.amount += c.item.amount;
        }
        this.UPDATE_PLAYER_ATTR({ player, idx: this.tab });
      }
    },
    sortEncounter() {
      alert("encontro");
    },
    sortNothing() {
      alert("nada");
    },
    replaceEvoluted(pokemon, oldPokemon) {
      pokemon["onTeam"] = oldPokemon.onTeam;
      pokemon["wins"] = oldPokemon.wins;
      pokemon["defeated"] = oldPokemon.defeated;
      this.UPDATE_PLAYER({
        pokemon,
        name: this.activePlayer.name,
        isEvolve: true,
        oldPokemon,
      });
    },
    setDiceDifficult() {
      this.simpleChance = true;
      this.diceType = "single_d6";
      if (this.selectedPokemon.base_experience >= 120) {
        this.diceType = "d8";
      }
      if (this.selectedPokemon.base_experience >= 170) {
        this.diceType = "d8";
      }
      if (this.selectedPokemon.base_experience >= 200) {
        this.diceType = "d20";
      }
      if (this.selectedPokemon.base_experience < 120) {
        this.simpleChance = false;
      }
    },
  },
};
</script>

<style lang="scss">
.d6-number {
  font-size: 40px;
  margin: auto;
  position: absolute;
  top: 211px;
  left: 35%;
}

html {
  overflow: hidden;
}

.content {
  height: calc(100vh - 48px);
  width: 100%;
}

.main ::v-deep .v-toolbar__content {
  max-width: 100vw;
  overflow-x: auto;
}

.dice_main {
  height: 80px;
  width: 150px;
  border: 1px solid;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
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
