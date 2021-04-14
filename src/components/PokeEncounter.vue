<template>
  <div>
    <v-row dense style="max-height: 50px" class="justify-space-around pt-3">
      <v-col cols="12" class="pl-5">
        <span>Geração</span>
        <v-radio-group v-model="generation" row @change="filterPokemons">
          <v-radio class="mb-1" label="`1 ª" value="1"></v-radio>
          <v-radio class="mb-1" label="`2 ª" value="2"></v-radio>
          <v-radio class="mb-1" label="`3 ª" value="3"></v-radio>
          <v-radio class="mb-1" label="`4 ª" value="4"></v-radio>
          <v-radio class="mb-1" label="`5 ª" value="5"></v-radio>
          <v-radio class="mb-1" label="`6 ª" value="6"></v-radio>
          <v-radio class="mb-1" label="`7 ª" value="7"></v-radio>
          <v-radio class="mb-1" label="`8 ª" value="8"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="6" class="pl-5">
        <span>Habitat</span>
        <v-select
          :items="habitats"
          item-text="pt"
          item-value="name"
          v-model="selectedHabitat"
          color="red"
        ></v-select>
      </v-col>
      <v-col cols="6" class="pl-5">
        <v-checkbox label="lendário" v-model="legendaryFilter"></v-checkbox>
      </v-col>
      <v-col cols="6" class="pr-5" @click="findPokemon"
        ><v-btn>buscar</v-btn></v-col
      >
      <v-container v-if="!loading" fluid fill-height>
        <v-row
          dense
          justify="center"
          @click="catchPokemon"
          v-if="selectedPokemon.name && !isCatching && !captured"
        >
          <v-col cols="6" class="d-flex justify-center">
            <img
              height="100px"
              width="100px"
              :src="getSprite('front_default')"
            />
          </v-col>
          <v-col cols="6" class="d-flex justify-center">
            <img
              height="100px"
              width="100px"
              :src="getSprite('back_default')"
            />
          </v-col>

          <v-col cols="12">
            <h3 class="overline text-center text-capitalize">
              {{ selectedPokemon.name }} #{{ selectedPokemon.order }} HP
              {{ selectedPokemon.hp }}
            </h3>
          </v-col>

          <v-col cols="12" class="d-flex justify-center">
            <v-chip
              class="mx-2"
              v-for="(item, idx) in selectedPokemon.types"
              :key="idx"
              :color="colors[item.type.name]"
              >{{ item.type.name }}</v-chip
            >
          </v-col>
          <v-row dense class="mt-4"> </v-row>
        </v-row>
        <v-row dense v-else-if="isCatching" justify="center">
          <img src="../assets/capture.gif" height="100px" width="100px" />
        </v-row>
        <v-row dense v-else-if="captured" justify="center">
          <img src="../assets/captured.gif" height="100px" width="100px" />
        </v-row>
      </v-container>
      <v-container fill-height fluid v-else style="height: 430px">
        <v-row dense justify="center" class="px-4">
          <v-col class="d-flex justify-center">
            <v-img
              class="loading-logo"
              src="../assets/aMz1Qtu.gif"
              eager
              contain
              height="70px"
              width="70px"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </div>
</template>

<script>
import Http from "../plugins/http";
import { mdiAccountCheckOutline } from "@mdi/js";
import { mapActions } from "vuex";
export default {
  name: "PokeEncounter",
  data: () => ({
    types: [],
    joinTeamIcon: mdiAccountCheckOutline,
    fab: false,
    pokemons: [],
    avaliables: [],
    legendaryFilter: false,
    loading: false,
    btnLoading: false,
    habitats: [],
    genName: "generation-i",
    generation: "1",
    selectedPokemon: {},
    selectedHabitat: "grassland",
    selectedType: "",
    diceValue: 1,
    diceValue2: 1,
    simpleChance: true,
    diceType: "single_d6",
    showSecondDice: true,
    legendaries: [],
    isCatching: false,
    captured: false,
    hitCounter: 0,
    damageValue: 0,
  }),

  computed: {
    diceImg() {
      return require(`../assets/${this.diceType}.svg`);
    },
  },

  props: ["colors"],

  created() {
    this.fecthHabitats();
    this.legendaries = require("../data/pokemons.json").legendaries;
    this.filterPokemons(1);
  },

  methods: {
    ...mapActions(["JOIN_TEAM"]),
    filterPokemons(value) {
      console.log(value);
      Http.get(`/generation/${value}`).then((resp) => {
        this.avaliables = resp.data.pokemon_species;
        this.types = resp.data.types;
        this.genName = resp.data.name;
      });
    },
    fecthHabitats() {
      const t = {
        cave: "Caverna",
        forest: "Floresta",
        grassland: "Campo",
        mountain: "Montanha",
        "rough-terrain": "Terreno acidentado",
        rare: "Raro",
        sea: "Mar",
        urban: "Urbano",
        "waters-edge": "Beira d'água",
      };
      Http.get("/pokemon-habitat").then((resp) => {
        this.habitats = resp.data.results.map((h) => {
          return { pt: t[h.name], name: h.name };
        });
      });
    },
    findPokemon() {
      this.btnLoading = true;
      let idx = 0;
      let pokemon = "";
      if (this.legendaryFilter) {
        const legendaries = this.legendaries[this.generation];
        idx = Math.floor(Math.random() * legendaries.length);
        pokemon = legendaries[idx];
      } else {
        idx = Math.floor(Math.random() * this.avaliables.length);
        pokemon = this.avaliables[idx];
      }
      if (!pokemon) return;
      const getMethod = !this.legendaryFilter ? this.getByUrl : this.getByName;
      getMethod(!this.legendaryFilter ? pokemon.url : pokemon).then((resp) => {
        debugger;

        if (
          resp.data.generation.name === this.genName &&
          (this.legendaryFilter ||
            resp.data.habitat.name === this.selectedHabitat)
        ) {
          this.sortPokemon(resp.data);
        } else {
          this.findPokemon();
        }
      });
      // Http.get(`/type`)
      //   .then((resp) => resp.data.results.map((r) => r))
      //   .then((types) => {
      //     this.types = types;
      //   });

      // fetch(url)
      //   .then((resp) => resp.json())
      //   .then((data) => {
      //     this.pokemons = data.pokemon_species
      //       ? data.pokemon_species
      //       : data.results;
      //     this.sortPokemon();
      //   })
      //   .finally(() => (this.btnLoading = false));
    },
    getByUrl(url) {
      return Http.get(url);
    },
    getByName(name) {
      return Http.get(`/pokemon-species/${name}`);
    },
    getSprite(type) {
      return this.selectedPokemon.sprites[type];
    },
    catchPokemon() {
      this.hitCounter++;
      if (this.hitCounter === 4) {
        this.isCatching = true;
        setTimeout(() => {
          this.isCatching = false;
          if (this.selectedPokemon.capture_rate == 255) {
            this.captured = true;
            this.joinTeam();
          } else {
            const final = Math.floor(Math.random() * 255) + 1;

            if (final <= this.selectedPokemon.capture_rate + this.damageValue) {
              this.captured = true;
              this.joinTeam();
            } else {
              this.hitCounter = 0;
              this.damageValue = 0;
              this.selectedPokemon = {
                ...this.selectedPokemon,
                hp: this.selectedPokemon.stats[0].base_stat,
              };
              const speed = this.selectedPokemon.stats[5].base_stat;
              const final = Math.floor(Math.random() * 200) + 1;
              debugger;
              if (speed <= final.toFixed(0)) {
                alert(`${this.selectedPokemon.name} fugiu!`);
                this.selectedPokemon = {};
              }
            }
          }
        }, 3000);
      } else {
        const val = Math.floor(Math.random() * 20) + 1;
        this.damageValue += val;
        debugger;
        const hp = this.selectedPokemon.hp - val;
        this.selectedPokemon = { ...this.selectedPokemon, hp };
      }
    },
    sortDices() {
      const t = this.diceType.split("d");
      const range = t[1];
      this.diceValue = Math.floor(Math.random() * range) + 1;
      this.diceValue2 = Math.floor(Math.random() * range) + 1;
    },
    async sortPokemon(selected) {
      this.hitCounter = 0;
      this.damageValue = 0;
      // this.loading = true;
      // const idx = Math.floor(Math.random() * this.pokemons.length);

      try {
        let pokemonInfo = await Http.get(
          `/pokemon-species/${selected.name}`
        ).then((resp) => resp.data);
        let pokemonInfo2 = await Http.get(`/pokemon/${selected.name}`).then(
          (resp) => resp.data
        );

        setTimeout(() => {
          this.selectedPokemon = { ...pokemonInfo, ...pokemonInfo2 };
          this.selectedPokemon.hp = this.selectedPokemon.stats[0].base_stat;
          console.log("pokemon: ", this.selectedPokemon);

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
    },
    joinTeam() {
      console.log("juntou ao time");
      delete this.selectedPokemon.abilities;
      delete this.selectedPokemon.forms;
      delete this.selectedPokemon.species;
      delete this.selectedPokemon.stats;
      delete this.selectedPokemon.moves;
      this.JOIN_TEAM(this.selectedPokemon);
      setTimeout(() => {
        this.captured = false;
        this.selectedPokemon = {};
      }, 1500);
    },
    setDiceDifficult() {
      this.diceType = "d6";
      if (this.selectedPokemon.base_experience >= 120) {
        this.diceType = "d8";
      }
      if (this.selectedPokemon.base_experience >= 170) {
        this.diceType = "d8";
      }
      if (this.selectedPokemon.base_experience >= 200) {
        this.diceType = "d20";
      }
      this.sortDices();
    },
  },
};
</script>

<style scoped>
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
