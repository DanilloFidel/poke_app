<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-row dense>
        <v-app-bar color="white" dense>
          <v-btn icon @click="screen = 'enemies'">
            <img
              width="25px"
              height="25px"
              src="./assets/pokemon-trainer.svg"
            />
          </v-btn>

          <!-- <v-btn icon @click="screen = 'typesCompare'">
            <img width="25px" height="25px" src="./assets/fire.svg" />
          </v-btn> -->

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
          <v-btn icon @click="loadProgress">
            <v-icon>{{ loadIcon }}</v-icon>
          </v-btn>
          <v-btn icon @click="sortInitials">
            <img width="25px" height="25px" src="./assets/pokeball.svg" />
          </v-btn>
        </v-app-bar>

        <div class="content">
          <v-container v-show="screen === 'pokedex'" class="pa-0">
            <Pokedex :colors="colors" />
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
            <Enemy @set-xp="$refs.players.savePlayerXp()" :colors="colors" />
          </v-container>
          <v-container v-show="screen === 'typesCompare'" class="pa-0">
            <TypesCompare :colors="colors" />
          </v-container>
        </div>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import Pokedex from "@/components/Pokedex.vue";
import PokeEncounter from "@/components/PokeEncounter.vue";
import EventCards from "@/components/EventCards.vue";
import Enemy from "@/components/Enemy.vue";
import TypesCompare from "@/components/TypesCompare.vue";
import Players from "@/components/Players.vue";
import { mdiCalendarClockOutline } from "@mdi/js";
export default {
  name: "App",
  data: () => ({
    loadIcon: mdiCalendarClockOutline,
    drawer: true,
    screen: "pokeEncounter",
    fab: false,
    pokemons: [],
    loading: false,
    btnLoading: false,
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
    TypesCompare,
    Players,
  },

  computed: {
    diceImg() {
      return require(`./assets/${this.diceType}.svg`);
    },
    loadingImg() {
      return require("./assets/loading.gif");
    },
  },

  created() {
    this.fecthHabitats();
  },

  methods: {
    fecthHabitats() {
      this.btnLoading = true;
      fetch("https://pokeapi.co/api/v2/pokemon-habitat")
        .then((resp) => resp.json())
        .then((data) => {
          this.habitats = [...this.habitats, ...data.results];
        })
        .finally(() => (this.btnLoading = false));
    },
    loadProgress() {
      this.$refs.players.load();
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
      if (confirm("desejar reiniciar o jogo?")) {
        this.$refs.players.sortInitials();
      }
    },
    async sortPokemon() {
      this.loading = true;
      const idx = Math.floor(Math.random() * this.pokemons.length);
      // TODO buscar na regiao selecionada
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

<style>
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
</style>
