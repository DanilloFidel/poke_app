<template>
  <v-app>
    <v-container v-if="screen === 'pokedex'" class="pa-0">
      <Pokedex :colors="colors" />
    </v-container>
    <v-container v-if="screen === 'pokeEncounter'" class="pa-0">
      <PokeEncounter :colors="colors" />
    </v-container>
    <v-container v-if="screen === 'eventCards'" class="pa-0">
      <EventCards />
    </v-container>

    <v-speed-dial v-model="fab" bottom right absolute direction="top">
      <template v-slot:activator>
        <v-btn v-model="fab" color="blue darken-2" dark fab>
          <img width="60px" height="60px" src="./assets/pokeball.svg" />
        </v-btn>
      </template>
      <v-btn fab dark small color="white">
        <img width="25px" height="25px" src="./assets/pokemon-trainer.svg" />
      </v-btn>
      <v-btn fab dark small color="white" @click="screen = 'pokeEncounter'">
        <img width="25px" height="25px" src="./assets/pikachu.svg" />
      </v-btn>
      <v-btn fab dark small color="white" @click="screen = 'eventCards'">
        <img width="25px" height="25px" src="./assets/cards.svg" />
      </v-btn>
      <v-btn fab dark small color="white" @click="screen = 'pokedex'">
        <img width="25px" height="25px" src="./assets/pokemon-go.svg" />
      </v-btn>
    </v-speed-dial>
  </v-app>
</template>

<script>
import Pokedex from "@/components/Pokedex.vue";
import PokeEncounter from "@/components/PokeEncounter.vue";
import EventCards from "@/components/EventCards.vue";
export default {
  name: "App",
  data: () => ({
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
    changeHabitat(url) {
      debugger;
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
    async sortPokemon() {
      debugger;
      this.loading = true;
      const idx = Math.floor(Math.random() * this.pokemons.length);
      // TODO buscar na regiao selecionada
      const selected = this.pokemons[idx];

      try {
        let pokemonInfo = await fetch(selected.url).then((resp) => resp.json());
        let pokemonInfo2 = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${selected.name}`
        ).then((resp) => resp.json());

        console.log("pk: ", { ...pokemonInfo, ...pokemonInfo2 });
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
</style>