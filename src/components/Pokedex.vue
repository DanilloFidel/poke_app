<template>
  <div>
    <v-row dense style="max-height: 80px" align="center" justify="center">
      <v-col cols="5" align-self="center" class="text-center">
        <h3 class="mr-3">Pokédex v2.0.0</h3>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="search"
          color="red"
          label="Buscar"
          append-icon="mdi-close"
          @click:append="search = ''"
          @input="filterPokemon"
          @keyup.enter="filterPokemon"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-container fluid class="pokedex-box" @scroll="onScroll" v-if="!listInit">
      <div v-if="filteredList.length" id="content">
        <v-card
          elevation="3"
          v-for="(pokemon, i) in filteredList"
          :key="`poke-${i}`"
          class="my-2"
        >
          <v-row dense justify="space-around">
            <v-col cols="4">
              <img
                @click="toggleShiny(pokemon, i)"
                height="150px"
                width="150px"
                :src="
                  pokemon.showShiny
                    ? pokemon.sprites.front_shiny
                    : pokemon.sprites.front_default
                "
              />
            </v-col>
            <v-col cols="6" align-self="center">
              <span class="text-capitalize"
                ><b>Nome:</b> {{ pokemon.name }}
              </span>
              <br />
              <span class="text-capitalize"
                ><b>XP:</b> {{ pokemon.base_experience }}xp</span
              >
              <br />
              <v-chip
                small
                outlined
                class="mt-2 mr-2 overline elevation-3"
                v-for="(item, idx) in pokemon.types"
                :key="idx"
                :color="colors[item.type.name]"
                >{{ item.type.name }}</v-chip
              >
              <v-btn
                @click="openDetail(pokemon)"
                icon
                absolute
                style="top: 0; right: 0"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
        <v-card elevation="3" class="my-2" v-if="loading">
          <v-row dense justify="space-between">
            <v-col cols="12">
              <span>Carregando...</span>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <v-row dense v-else>
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-text
              >Nenhum Pokémon encontrado, tente buscar pelo nome
              completo</v-card-text
            >
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container fill-height fluid v-else style="height: 430px">
      <v-row dense justify="center" class="px-4">
        <v-col class="d-flex justify-center">
          <img class="loading-logo" src="../assets/loading.gif" />
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog">
      <PokemonDetail
        :pokemon="selectedPokemon"
        :dialog="dialog"
        @close="closeDetail"
        @update-pokemon="selectedPokemon = $event"
      />
    </v-dialog>
  </div>
</template>

<script>
import Http from "../plugins/http";
import debounce from "lodash/debounce";
import Vue from "vue";
import PokemonDetail from "./PokemonDetail";
import throttle from "lodash/throttle";

export default {
  name: "Pokedex",
  data: () => ({
    baseUrl: "https://pokeapi.co/api/v2/pokemon",
    dialog: false,
    search: "",
    listInit: false,
    nextPage: "limit=20",
    previousPage: null,
    pokemons: [],
    filteredList: [],
    loading: false,
    btnLoading: false,
    selectedPokemon: {},
    evolutions: [],
    selectedPkmEvols: [],
  }),

  watch: {
    search(val) {
      !val.length && (this.filteredList = [...this.pokemons]);
    },
  },

  components: {
    PokemonDetail,
  },

  props: ["colors"],

  created() {
    this.listInit = true;
    this.getPokemons();
  },

  methods: {
    openDetail(pokemon) {
      this.dialog = !this.dialog;
      this.selectedPokemon = pokemon;
    },
    closeDetail() {
      this.dialog = false;
      this.selectedPokemon = {};
    },

    toggleShiny: throttle(function (poke, index) {
      poke.showShiny = !poke.showShiny;
      Vue.set(this.filteredList, index, { ...poke });
    }, 500),

    onScroll: throttle(function (e) {
      const content = document.getElementById("content");
      const scrollH = e.target.offsetHeight + e.target.scrollTop;
      if (
        content &&
        content.offsetHeight - scrollH <= 30 &&
        !this.loading &&
        this.nextPage
      ) {
        this.getPokemons().then(() => {
          e.target.scrollTo({
            top: 3,
          });
        });
      } else if (e.target.scrollTop == 0 && this.previousPage) {
        this.getPokemons(this.previousPage).then(() => {
          e.target.scrollTo({
            top: 100,
          });
        });
      }
    }, 300),

    async getPokemons(params = this.nextPage) {
      try {
        this.loading = true;
        const firstPokes = await Http.get(`pokemon?${params}`).then(
          (resp) => resp.data
        );
        if (firstPokes.next) {
          const splited = firstPokes.next.split("?");
          this.nextPage = splited[1];
        } else this.nextPage = null;
        if (firstPokes.previous) {
          const splitedPreviously = firstPokes.previous.split("?");
          this.previousPage = splitedPreviously[1];
        } else this.previousPage = null;
        const pokemons = await this.getFullInfo(firstPokes.results);
        this.pokemons = pokemons;
        this.filteredList = [...this.pokemons];
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
      this.listInit = false;
    },
    async getFullInfo(list = []) {
      const apiCalls = [];
      list.forEach((item) => {
        apiCalls.push(Http.get(`pokemon/${item.name}`));
      });
      const resps = await Promise.all(apiCalls).then((resp) =>
        resp.map((r) => r.data)
      );
      return resps;
    },

    filterPokemon: debounce(function () {
      this.filteredList = this.search.length
        ? this.pokemons.filter((p) => p.name.includes(this.search))
        : this.pokemons;
      if (!this.filteredList.length) {
        Http.get(`${this.baseUrl}/${this.search}`).then((resp) =>
          this.filteredList.push(resp.data)
        );
      }
    }, 500),
  },
};
</script>

<style scoped>
.pokedex-box {
  height: calc(100vh - 50px);
  overflow: auto;
  padding: 20px 5px;
}

::v-deep .v-input__icon--append > .v-icon {
  font-size: 15px;
}

.loading-logo {
  width: 320px;
  height: 300px;
}
</style>
