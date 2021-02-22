<template>
  <v-card>
    <v-card-title class="overline">
      {{ fullPokemon.name }}
    </v-card-title>
    <v-card-text>
      <span class="text-left"
        ><b>Chance de captura:</b> {{ fullPokemon.capture_rate }}%</span
      ><br />
      <span class="text-left"
        ><b>Geração:</b> {{ fullPokemon.generation.name }}</span
      ><br />
      <span class="text-left mr-2"
        ><b>Evolui de:</b>
        <span class="text-capitalize">{{
          fullPokemon.evolves_from_species
            ? fullPokemon.evolves_from_species.name
            : '-.-'
        }}</span></span
      ><br />
      <span class="text-left"
        ><b>Habitat:</b> {{ fullPokemon.habitat.name }}</span
      ><br />
      <span class="text-left"
        ><b>Chance de captura:</b> {{ fullPokemon.capture_rate }}%</span
      ><br />
      <span class="text-left" v-if="fullPokemon.is_legendary"
        ><b>Lendário</b></span
      ><br />
      <span class="text-left" v-if="fullPokemon.is_mythical"><b>Mítico</b></span
      ><br />
    </v-card-text>
    <v-card-text v-if="fullPokemon.varieties.some((v) => !v.is_default)">
      <h5>Variações</h5>
      <div v-for="(p, i) in fullPokemon.varieties" :key="`variacoes-${i}`">
        <a @click="getPokemon(p.pokemon.url)">
          <span v-if="!p.is_default">{{ p.pokemon.name }}</span>
        </a>
        <br />
      </div>
      <div v-if="specialPokemon.name" class="art-box mt-3">
        <img
          height="150px"
          width="150px"
          :src="specialPokemonImg(specialPokemon.sprites)"
        />
      </div>
    </v-card-text>
    <v-card-text>
      <h5>Golpes</h5>
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr v-for="(item, i) in fullPokemon.abilities" :key="item.name + i">
              <td>{{ item.ability.name }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-card-text>
      <h5>Status</h5>
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr v-for="(item, i) in fullPokemon.stats" :key="item.base_stat + i">
              <td>{{ item.stat.name }}: {{ item.base_stat }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-card-text>
      <h5>Jogos (versões)</h5>
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr v-for="(item, i) in fullPokemon.game_indices" :key="item.game_index + i">
              <td>{{ item.version.name }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
import Http from '../plugins/http'

export default {
  name: 'PokemonDetailComponent',
  data: () => ({
    fullPokemon: {},
    specialPokemon: {},
  }),
  props: ['dialog', 'pokemon'],
  watch: {
    pokemon: {
      handler: function (val) {
        val && this.findPokemon(val)
      },
      immediate: true,
    },
    dialog(val) {
      if (!val) {
        this.specialPokemon = {}
      }
    },
  },
  methods: {
    async findPokemon(obj) {
      try {
        const subInfos = await fetch(
          `https://pokeapi.co/api/v2/pokemon-species/${obj.name}`
        ).then((resp) => resp.json())
        this.fullPokemon = { ...this.pokemon, ...subInfos }
        console.log(this.fullPokemon)
      } catch (error) {
        console.log(error)
      }
    },
    getPokemon(url) {
      Http.get(url).then((resp) => {
        this.specialPokemon = resp.data
        console.log(this.specialPokemon)
      })
    },
    specialPokemonImg(sprites) {
      if (sprites.front_default) return sprites.front_default
      if (sprites.other['official-artwork'].front_default)
        return sprites.other['official-artwork'].front_default
      else return require('../assets/Pokémon-Pikachu.jpg')
    },
  },
}
</script>

<style>
.art-box {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #8e2c2c;
}
</style>
