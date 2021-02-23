<template>
  <v-card>
    <v-card-title class="overline">
      {{ fullPokemon.name }} #{{ pokemon.id }}
    </v-card-title>
    <v-btn icon absolute top right @click="closeModal"
      ><v-icon>mdi-close</v-icon></v-btn
    >
    <v-card-text>
      <v-carousel
        height="300px"
        hide-delimiters
        class="mb-3"
        :show-arrows="pkVersions.length > 1"
        v-model="carrouselModel"
      >
        <v-carousel-item
          v-for="(item, i) in pkVersions"
          :key="`img-${i}`"
          :src="item"
        ></v-carousel-item>
      </v-carousel>
      <span class="text-left"
        ><b>Chance de captura:</b> {{ fullPokemon.capture_rate }}%</span
      ><br />
      <span class="text-left"
        ><b>Altura: </b>{{ pkHeight(pokemon.height) }}</span
      ><br />
      <span class="text-left"
        ><b>Geração: </b>
        <span class="text-uppercase ml-3">{{
          fullPokemon.generation.name.split("-")[1]
        }}</span></span
      ><br />
      <span class="text-left"
        ><b>Evolui de:</b>
        <span class="text-capitalize ml-3">{{
          fullPokemon.evolves_from_species
            ? fullPokemon.evolves_from_species.name
            : "-.-"
        }}</span></span
      ><br />
      <span class="text-left"
        ><b>Habitat:</b> {{ fullPokemon.habitat.name }}</span
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
    </v-card-text>
    <v-card-text>
      <h5>Golpes</h5>
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <tr
              v-for="(item, i) in fullPokemon.abilities"
              :key="`${item.name} - ${i}`"
            >
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
            <tr
              v-for="(item, i) in fullPokemon.stats"
              :key="item.base_stat + i"
            >
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
            <tr
              v-for="(item, i) in fullPokemon.game_indices"
              :key="`${item.game_index} - ${i}`"
            >
              <td>{{ item.version.name }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
import Http from "../plugins/http";

export default {
  name: "PokemonDetailComponent",
  data: () => ({
    fullPokemon: {},
    carrouselModel: 0,
    pkVersions: [],
  }),
  props: ["dialog", "pokemon"],
  watch: {
    pokemon: {
      handler: function (val) {
        val.name && this.findPokemon(val);
      },
      immediate: true,
    },
  },
  methods: {
    closeModal() {
      this.carrouselModel = 0;
      this.$emit("close");
    },
    async findPokemon(obj) {
      this.pkVersions = [this.pokemon.sprites.front_default];
      let subInfos = {};
      try {
        subInfos = await Http.get(
          `https://pokeapi.co/api/v2/pokemon-species/${obj.name}`
        ).then((resp) => resp.data);
      } catch (error) {
        console.log(error);
      }
      debugger;
      Object.assign(this.fullPokemon, { ...this.pokemon, ...subInfos });
      this.pkVersions = [
        this.fullPokemon.sprites.other["official-artwork"].front_default,
      ];
      this.setImgs();
      console.log(this.fullPokemon);
    },
    setImgs() {
      this.pokemon.sprites &&
        Object.values(this.pokemon.sprites).forEach((item) => {
          if (!item) return;
          if (item && item.length) this.pkVersions.push(item);
          if (item.dream_world) {
            item.dream_world.front_default &&
              this.pkVersions.push(item.dream_world.front_default);
            item.dream_world.front_female &&
              this.pkVersions.push(item.dream_world.front_female);
          }
        });
      console.log(this.pkVersions);
    },
    getPokemon(url) {
      Http.get(url).then((resp) => {
        this.$nextTick(() => {
          this.carrouselModel = 0;
        });
        this.$emit("update-pokemon", resp.data);
      });
    },
    pkHeight(height = 0) {
      let h = height / 10;
      const n = (h + "").split(".");
      return `${n[0] > 0 ? n[0] + "m" : ""} ${n[1] ? n[1] + "0cm" : ""}`;
    },
  },
};
</script>

<style scoped>
.art-box {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #8e2c2c;
}

::v-deep .v-btn--icon.v-size--default .v-icon {
  font-size: 15px !important;
}

::v-deep .v-image__image--cover {
  background-size: contain;
}
</style>
