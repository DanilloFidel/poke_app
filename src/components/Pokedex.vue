<template>
  <div>
    <v-row dense style="max-height: 80px" align="center" justify="center">
      <v-col cols="5" align-self="center" class="text-center">
        <h3 class="mr-3">Pokédex v.1.5</h3>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="search"
          color="red"
          label="Buscar com nome"
          append-icon="mdi-close"
          @click:append="search = ''"
          @input="filterPokemon"
          @keyup.enter="filterPokemon"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-container fluid class="pokedex-box" @scroll="onScroll">
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
            <v-col cols="6">
              <span class="text-capitalize"
                ><b>Nome:</b> {{ pokemon.name }} #{{ pokemon.id }}
              </span>
              <br />
              <span class="text-capitalize"
                ><b>XP:</b> {{ pokemon.base_experience }}xp</span
              >
              <br />
              <span class="text-capitalize"
                ><b>Altura:</b> {{ pkHeight(pokemon.height) }}</span
              >
              <br />
              <v-chip
                class="mt-2 mr-2"
                v-for="(item, idx) in pokemon.types"
                :key="idx"
                :color="colors[item.type.name]"
                >{{ item.type.name }}</v-chip
              >
              <v-btn
                @click="openDetail(pokemon)"
                icon
                absolute
                style="bottom: 0; right: 0"
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
    <v-dialog v-model="dialog">
      <PokemonDetail :pokemon="selectedPokemon" :dialog="dialog" />
    </v-dialog>
  </div>
</template>

<script>
import Http from '../plugins/http'
import debounce from 'lodash/debounce'
import Vue from 'vue'
import PokemonDetail from './PokemonDetail'
import throttle from 'lodash/throttle'

export default {
  name: 'Pokedex',
  data: () => ({
    baseUrl: 'https://pokeapi.co/api/v2/pokemon',
    dialog: false,
    search: '',
    nextPage: 'limit=50',
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
      !val.length && (this.filteredList = [...this.pokemons])
    },
  },

  components: {
    PokemonDetail,
  },

  props: ['colors'],

  created() {
    this.getPokemons()
  },

  methods: {
    openDetail(pokemon) {
      this.dialog = !this.dialog
      this.selectedPokemon = pokemon
    },
    pkHeight(height = 0) {
      let h = height / 10
      const n = (h + '').split('.')
      return `${n[0] > 0 ? n[0] + 'm' : ''} ${n[1] ? n[1] + '0cm' : ''}`
    },
    toggleShiny(poke, index) {
      poke.showShiny = !poke.showShiny
      Vue.set(this.filteredList, index, { ...poke })
    },
    onScroll: throttle(function (e) {
      const content = document.getElementById('content')
      const scrollH = e.target.offsetHeight + e.target.scrollTop
      if (
        content &&
        content.offsetHeight - scrollH <= 30 &&
        !this.loading &&
        this.nextPage
      ) {
        this.getPokemons().then(() => {
          e.target.scrollTo({
            top: 3,
          })
        })
      } else if (e.target.scrollTop == 0 && this.previousPage) {
        this.getPokemons(this.previousPage).then(() => {
          e.target.scrollTo({
            top: 100,
          })
        })
      }
    }, 300),

    async getPokemons(params = this.nextPage) {
      try {
        this.loading = true
        debugger
        const firstPokes = await Http.get(`pokemon?${params}`).then(
          (resp) => resp.data
        )
        if (firstPokes.next) {
          const splited = firstPokes.next.split('?')
          this.nextPage = splited[1]
        } else this.nextPage = null
        if (firstPokes.previous) {
          const splitedPreviously = firstPokes.previous.split('?')
          this.previousPage = splitedPreviously[1]
        } else this.previousPage = null
        const pokemons = await this.getFullInfo(firstPokes.results)
        debugger
        console.log(pokemons)
        this.pokemons = pokemons
        console.log('pok: ', this.pokemons)
        this.filteredList = [...this.pokemons]
        console.log('filtred: ', this.filteredList)
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    async getFullInfo(list = []) {
      const apiCalls = []
      list.forEach((item) => {
        apiCalls.push(Http.get(`pokemon/${item.name}`))
      })
      const resps = await Promise.all(apiCalls).then((resp) =>
        resp.map((r) => r.data)
      )
      return resps
    },

    filterPokemon: debounce(function () {
      this.filteredList = this.search.length
        ? this.pokemons.filter((p) => p.name.includes(this.search))
        : this.pokemons
      if (!this.filteredList.length) {
        Http.get(`${this.baseUrl}/${this.search}`).then((resp) =>
          this.filteredList.push(resp.data)
        )
      }
    }, 500),
  },
}
</script>

<style scoped>
.pokedex-box {
  height: calc(100vh - 50px);
  overflow: auto;
  padding: 20px 10px;
}

::v-deep .v-input__icon--append > .v-icon {
  font-size: 15px;
}
</style>
