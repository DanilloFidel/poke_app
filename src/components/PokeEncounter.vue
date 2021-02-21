<template>
  <div>
    <v-row dense style="max-height: 50px" class="justify-space-around pt-3">
      <v-col cols="6" style="height: 50px">
        <v-select
          :items="habitats"
          v-model="selectedHabitat"
          item-text="name"
          item-value="url"
          color="red"
          label="Habitat"
          @change="changeHabitat"
        ></v-select>
      </v-col>
    </v-row>
    <v-container
      v-if="!loading && selectedPokemon.name"
      fluid
      fill-height
      style="height: 430px"
    >
      <v-row dense justify="center">
        <v-col cols="6" class="d-flex justify-center">
          <img
            v-if="
              selectedPokemon.sprites && selectedPokemon.sprites.front_default
            "
            height="150px"
            width="150px"
            :src="selectedPokemon.sprites.front_default"
          />
        </v-col>
        <v-col
          cols="6"
          class="d-flex justify-center"
          v-if="selectedPokemon.sprites && selectedPokemon.sprites.back_default"
        >
          <img
            height="150px"
            width="150px"
            :src="selectedPokemon.sprites.back_default"
          />
        </v-col>

        <v-col cols="12">
          <h3 class="overline text-center text-capitalize">
            {{ selectedPokemon.name }} #{{ selectedPokemon.order }} -
            {{ selectedPokemon.base_experience }}xp
          </h3>
        </v-col>

        <v-col cols="6" class="d-flex justify-center">
          <v-chip
            class="mx-2"
            v-for="(item, idx) in selectedPokemon.types"
            :key="idx"
            :color="colors[item.type.name]"
            >{{ item.type.name }}</v-chip
          >
        </v-col>
        <v-row dense class="mt-4">
          <v-col cols="3" class="ml-3">
            <img :src="diceImg" width="60px" height="60px" />
          </v-col>
          <v-col class="text-center" align-self="center">
            <span v-if="simpleChance"
              >Tire <b>{{ diceValue }}</b> no dado para capturar</span
            >
            <span v-else
              >Tire <b>{{ diceValue }}</b> ou <b>{{ diceValue2 }}</b> no dado
              <br />
              para capturar</span
            >
          </v-col>
        </v-row>
      </v-row>
      <v-btn
        @click="sortPokemon"
        absolute
        left
        fab
        width="50px"
        height="50px"
        style="bottom: 15px"
      >
        <img width="25px" height="25px" src="../assets/roll_dice.svg" />
      </v-btn>
    </v-container>
    <v-container fill-height fluid v-else style="height: 430px">
      <v-row dense justify="center">
        <v-col cols="8" class="text-center">
          <span>Escolha um tipo de Habitat</span>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "PokeEncounter",
  data: () => ({
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

  computed: {
    diceImg() {
      return require(`../assets/${this.diceType}.svg`);
    },
    loadingImg() {
      return require("../assets/loading.gif");
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