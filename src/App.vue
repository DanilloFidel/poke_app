<template>
  <v-app>
    <v-container fluid class="pa-0 main">
      <v-row dense>
        <v-app-bar color="white" dense>
          <v-btn icon @click="screen = 'enemies'">
            <img
              width="25px"
              height="25px"
              src="./assets/pokemon-trainer.svg"
            />
          </v-btn>

          <v-btn icon @click="setupDiceBattle">
            <img width="25px" height="25px" src="./assets/d6.svg" />
          </v-btn>

          <v-btn icon @click="screen = 'pokeEncounter'">
            <img width="25px" height="25px" src="./assets/pikachu.svg" />
          </v-btn>
          <v-btn icon @click="screen = 'players'">
            <img width="25px" height="25px" src="./assets/treasure-map.svg" />
          </v-btn>
          <v-btn icon @click="screen = 'eventCards'">
            <img width="25px" height="25px" src="./assets/cards.svg" />
          </v-btn>
          <v-btn icon @click="screen = 'pokedex'">
            <img width="25px" height="25px" src="./assets/pokemon-go.svg" />
          </v-btn>
          <v-btn icon @click="screen = 'data'">
            <img width="25px" height="25px" src="./assets/pokeball.svg" />
          </v-btn>
          <v-btn icon @click="screen = 'arena'">
            <img width="25px" height="25px" src="./assets/d6.svg" />
          </v-btn>
        </v-app-bar>

        <div class="content">
          <v-container v-show="screen === 'pokedex'" class="pa-0">
            <Pokedex :colors="colors" />
          </v-container>
          <v-container v-show="screen === 'data'" class="pa-0">
            <DataSetup
              @update-slot="slot = $event"
              @load-slot="loadProgress"
              @new-game="sortInitials"
            />
          </v-container>
          <v-container v-show="screen === 'pokeEncounter'" class="pa-0">
            <PokeEncounter :colors="colors" />
          </v-container>
          <v-container v-show="screen === 'eventCards'" class="pa-0">
            <EventCards
              :habitats="
                habitats.map((h) => h.name).filter((h) => h.name !== 'rare')
              "
            />
          </v-container>
          <v-container v-show="screen === 'players'" class="pa-0">
            <Players ref="players" :colors="colors" />
          </v-container>
          <v-container v-show="screen === 'enemies'" class="pa-0">
            <Enemy ref="enemies" :colors="colors" />
          </v-container>
          <v-container v-show="screen === 'arena'" class="pa-0">
            <arena :colors="colors" :screen="screen"></arena>
          </v-container>
          <!-- <v-container v-show="screen === 'typesCompare'" class="pa-0">
            <TypesCompare :colors="colors" />
          </v-container> -->
        </div>
      </v-row>
    </v-container>

    <v-dialog v-model="diceModal">
      <v-card color="white" class="pa-3" style="height: 60vh">
        <v-row dense v-if="activePlayer.pokemons">
          <v-select
            :items="
              activePlayer.pokemons.filter((p) => p.onTeam && !p.defeated)
            "
            item-text="name"
            v-model="battlePokemon"
            return-object
            @change="setPlayerPokemonInBattle"
          ></v-select>
        </v-row>
        <v-row dense style="height: 35%"
          ><v-col cols="12" style="height: 15%">
            <span
              >Adversário: {{ diceBattle.enemy.poke }}
              <b class="ml-5">D{{ diceBattle.enemy.type }}</b></span
            >
          </v-col>
          <v-row dense justify="center" align="center">
            <v-col
              cols="4"
              @click="sortBattleDice('enemy')"
              class="dice_main"
              :style="{
                border: `1px solid ${
                  diceBattle.enemy.value > diceBattle.player.value
                    ? 'green'
                    : 'black'
                }`,
              }"
            >
              {{ diceBattle.enemy.value }}</v-col
            >
          </v-row>
        </v-row>
        <v-row dense style="height: 35%"
          ><v-col cols="12" style="height: 15%">
            <span
              >Jogador: {{ diceBattle.player.poke
              }}<b class="ml-5">D{{ diceBattle.player.type }}</b></span
            >
          </v-col>
          <v-row dense justify="center" align="center">
            <v-col
              cols="4"
              @click="sortBattleDice('player')"
              class="dice_main"
              :style="{
                border: `1px solid ${
                  diceBattle.player.value > diceBattle.enemy.value
                    ? 'green'
                    : 'black'
                }`,
              }"
            >
              {{ diceBattle.player.value }}</v-col
            >
          </v-row>
        </v-row>
        <v-row dense class="d-flex mt-3" style="justofy-content: flex-end">
          <v-btn @click="endBattle" x-small>Finalizar</v-btn>
        </v-row>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import Pokedex from "@/components/Pokedex.vue";
import PokeEncounter from "@/components/PokeEncounter.vue";
import EventCards from "@/components/EventCards.vue";
import Enemy from "@/components/Enemy.vue";
import DataSetup from "@/components/DataSetup.vue";
import Arena from "@/components/Arena.vue";
// import TypesCompare from "@/components/TypesCompare.vue";
import Players from "@/components/Players.vue";
import { mdiCalendarClockOutline } from "@mdi/js";
import { mapActions, mapState } from "vuex";
export default {
  name: "App",
  data: () => ({
    battlePokemon: {},
    diceModal: false,
    loadIcon: mdiCalendarClockOutline,
    drawer: true,
    screen: "pokeEncounter",
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
    Pokedex,
    PokeEncounter,
    EventCards,
    Enemy,
    // TypesCompare,
    Players,
    DataSetup,
    Arena,
  },

  watch: {
    screen() {
      this.$refs.players && this.$refs.players.saveActivePlayer();
    },
    diceModal(val) {
      if (!val) {
        this.SET_DICE_BATTLE();
      }
    },
  },

  computed: {
    ...mapState(["diceBattle", "activePlayer", "activeFighter"]),
    diceImg() {
      return require(`./assets/${this.diceType}.svg`);
    },
    loadingImg() {
      return require("./assets/loading.gif");
    },
  },

  created() {
    this.fecthHabitats();
    // setInterval(() => {
    //   this.$refs.players.saveProgress(this.slot);
    // }, 10000);
  },

  methods: {
    ...mapActions([
      "SET_DICE_BATTLE",
      "SET_SINGLE_DICE_BATTLE",
      "SET_VALUE_DICE_BATTLE",
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
    setupDiceBattle() {
      this.diceModal = !this.diceModal;
      this.SET_DICE_BATTLE();
      if (this.diceModal) {
        this.setPlayerPokemonInBattle(this.battlePokemon);
      }
    },
    sortBattleDice(to) {
      const type = this.diceBattle[to].type;
      const value = Math.floor(Math.random() * type) + 1;
      this.SET_VALUE_DICE_BATTLE({
        val: value,
        name: to,
      });
      console.log(value);
    },
    setPlayerPokemonInBattle(poke) {
      this.SET_SINGLE_DICE_BATTLE({
        val: poke.base_experience,
        poke: poke.name,
        name: "player",
      });
    },
    loadProgress(slot) {
      this.$refs.players.load(slot);
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
    sortDices() {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
    },
    sortInitials() {
      if (confirm("desejar iniciar um novo jogo?")) {
        this.$refs.players.sortInitials();
      }
    },
    endBattle() {
      if (this.diceBattle.player.value > this.diceBattle.enemy.value) {
        this.$refs.enemies.defeatePokemon(this.diceBattle.enemy.poke);
        this.$refs.players.winBattle(this.diceBattle.player.poke);

        const nextPoke = this.activeFighter.pokemons.filter(
          (p) => !p.defeated
        )[0];

        if (this.activeFighter.pokemons.every((p) => p.defeated)) {
          this.diceModal = false;
          this.screen = "enemies";
        } else {
          this.SET_SINGLE_DICE_BATTLE({
            name: "enemie",
            val: nextPoke.base_experience,
            poke: nextPoke.name,
          });
          this.setPlayerPokemonInBattle(this.battlePokemon);
        }
      } else if (this.diceBattle.player.value < this.diceBattle.enemy.value) {
        this.$refs.players.defeatPokemon(this.diceBattle.player.poke);
        this.battlePokemon = {};
        this.diceModal = false;
      }
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
</style>
