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
    <v-container v-if="!loading" fluid fill-height style="height: 430px">
      <v-row dense justify="center" v-if="selectedPokemon.name">
        <v-col cols="6" class="d-flex justify-center">
          <img height="150px" width="150px" :src="getSprite('front_default')" />
        </v-col>
        <v-col cols="6" class="d-flex justify-center">
          <img height="150px" width="150px" :src="getSprite('back_default')" />
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
            <span
              >Tire <b>{{ diceValue }}</b> ou <b>{{ diceValue2 }}</b> no dado
              <br />
              para capturar</span
            >
          </v-col>
        </v-row>
      </v-row>
      <v-row dense justify="center" v-else>
        <v-col cols="8" class="text-center">
          <span>Escolha um tipo de Habitat</span>
        </v-col>
      </v-row>
      <v-btn
        v-if="selectedPokemon.name"
        @click="sortPokemon"
        :loading="btnLoading"
        absolute
        left
        fab
        width="50px"
        height="50px"
        style="bottom: 15px"
      >
        <img width="25px" height="25px" src="../assets/roll_dice.svg" />
      </v-btn>
      <v-btn
        v-if="selectedPokemon.name"
        @click="joinTeam"
        :loading="btnLoading"
        absolute
        right
        fab
        width="50px"
        height="50px"
        style="bottom: 15px"
      >
        <v-icon>{{ joinTeamIcon }}</v-icon>
      </v-btn>
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
  </div>
</template>

<script>
import Http from '../plugins/http'
import { mdiAccountCheckOutline } from '@mdi/js'
import { mapActions } from 'vuex'
export default {
  name: 'PokeEncounter',
  data: () => ({
    joinTeamIcon: mdiAccountCheckOutline,
    fab: false,
    pokemons: [],
    loading: false,
    btnLoading: false,
    habitats: [
      {
        name: 'random all',
        url: 'https://pokeapi.co/api/v2/pokemon?limit=1118',
      },
    ],
    selectedPokemon: {},
    selectedHabitat: '',
    diceValue: 1,
    diceValue2: 1,
    simpleChance: true,
    diceType: 'single_d6',
    showSecondDice: true,
  }),

  computed: {
    diceImg() {
      return require(`../assets/${this.diceType}.svg`)
    },
  },

  props: ['colors'],

  created() {
    this.fecthHabitats()
  },

  methods: {
    ...mapActions(["JOIN_TEAM"]),
    fecthHabitats() {
      this.btnLoading = true
      Http.get('/pokemon-habitat')
        .then((resp) => {
          this.habitats = [...this.habitats, ...resp.data.results]
        })
        .finally(() => (this.btnLoading = false))
    },
    changeHabitat(url) {
      this.btnLoading = true
      fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
          this.pokemons = data.pokemon_species
            ? data.pokemon_species
            : data.results
          this.sortPokemon()
        })
        .finally(() => (this.btnLoading = false))
    },
    getSprite(type) {
      return this.selectedPokemon.sprites[type]
    },
    sortDices() {
      const t = this.diceType.split('d')
      const range = t[1]
      this.diceValue = Math.floor(Math.random() * range) + 1
      this.diceValue2 = Math.floor(Math.random() * range) + 1
    },
    async sortPokemon() {
      this.loading = true
      const idx = Math.floor(Math.random() * this.pokemons.length)
      const selected = this.pokemons[idx]

      try {
        let pokemonInfo = await Http.get(
          `/pokemon-species/${selected.name}`
        ).then((resp) => resp.data)
        let pokemonInfo2 = await Http.get(`/pokemon/${selected.name}`).then(
          (resp) => resp.data
        )

        setTimeout(() => {
          this.selectedPokemon = { ...pokemonInfo, ...pokemonInfo2 }
          if (
            this.selectedPokemon.sprites &&
            !this.selectedPokemon.sprites.front_default
          ) {
            this.sortPokemon()
          } else {
            this.setDiceDifficult()
            this.loading = false
          }
        }, 1500)
      } catch (error) {
        this.loading = false
        alert('Ocorreu um erro ao carregar o Pokemon')
      }
    },
    joinTeam(){
      this.JOIN_TEAM(this.selectedPokemon)
    },
    setDiceDifficult() {
      this.diceType = 'd6'
      if (this.selectedPokemon.base_experience >= 120) {
        this.diceType = 'd8'
      }
      if (this.selectedPokemon.base_experience >= 170) {
        this.diceType = 'd8'
      }
      if (this.selectedPokemon.base_experience >= 200) {
        this.diceType = 'd20'
      }
      this.sortDices()
    },
  },
}
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
