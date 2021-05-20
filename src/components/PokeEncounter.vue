<template>
  <div>
    <v-row dense class="justify-space-around pt-3">
      <v-col cols="12" class="pl-5">
        <span>Geração</span>
        <v-radio-group
          v-model="generation"
          row
          @change="toggleTypes(false), (selectedPokemon = {}), filterPokemons()"
        >
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
          :items="areas"
          item-text="nome"
          return-object
          v-model="selectedArea"
          color="red"
        ></v-select>
      </v-col>
      <v-col cols="6" class="pl-5">
        <v-checkbox
          @change="toggleTypes"
          :disabled="genLoading || loading"
          label="lendários"
          v-model="legendaryFilter"
        ></v-checkbox>
      </v-col>
      <v-row dense>
        <v-col
          class="d-flex justify-center"
          cols="12"
          @click="findPokemon(true)"
          ><v-btn
            x-small
            :loading="genLoading || loading"
            :disabled="!selectedArea"
            >buscar</v-btn
          ></v-col
        >
      </v-row>
      <v-container v-if="!loading" fluid fill-height style="min-height: 200px">
        <v-row
          dense
          justify="center"
          v-if="selectedPokemon.name && !isCatching && !captured"
        >
          <v-col cols="6" class="d-flex justify-center">
            <img
              height="130px"
              width="130px"
              :src="getSprite('front_default')"
            />
          </v-col>

          <v-col cols="6">
            <h3 class="overline text-center text-capitalize">
              <b>{{ selectedPokemon.name }}</b>
              <br />
              Dado
              {{ getDiceType(selectedPokemon.base_experience) }}
              <br />
              ATTACK
              {{ selectedPokemon.stats[1].base_stat }}
              <br />
              HP
              {{ selectedPokemon.stats[0].base_stat }}
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
      <v-container fill-height fluid v-else style="min-height: 200px">
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
      <v-container fill-height fluid>
        <v-row dense justify="center" class="px-4">
          <v-col
            class="d-flex justify-center mx-1"
            v-for="(pokeball, idx) in playerPokeballs"
            :key="`pokeball_${idx}`"
          >
            <img
              @click="pokeball.amount && catchPokemon(pokeball)"
              class="loading-logo"
              :src="getImg(pokeball.img)"
              eager
              contain
              height="30px"
              width="30px"
            />
            <span class="ml-2">{{ pokeball.amount }}</span>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </div>
</template>

<script>
import Http from "../plugins/http";
import { mdiAccountCheckOutline } from "@mdi/js";
import { mapActions, mapState } from "vuex";
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
    genName: "generation-i",
    generation: "1",
    selectedPokemon: {},
    selectedArea: {},
    selectedType: "",
    diceValue: 1,
    diceValue2: 1,
    simpleChance: true,
    diceType: "single_d6",
    showSecondDice: true,
    legendaries: [],
    isCatching: false,
    captured: false,
    selectedBall: {},
    damageValue: 0,
    genLoading: false,
    areas: [],
  }),
  components: {},

  computed: {
    ...mapState(["activePlayer", "pokeballTypes"]),
    diceImg() {
      return require(`../assets/${this.diceType}.svg`);
    },
    playerPokeballs() {
      return this.activePlayer.bag.filter(
        (item) => !!item.captureBonus || item.isMaster
      );
    },
  },

  props: ["colors", "tab"],

  created() {
    this.filterPokemons();
  },

  mounted() {
    console.log(this.activePlayer);
    console.log(this.playerPokeballs);
  },

  methods: {
    ...mapActions(["JOIN_TEAM", "REMOVE_PLAYER_ITEM"]),
    filterPokemons() {
      this.selectedArea = {};
      this.isCatching = false;
      let a = [];
      for (let index = 1; index <= this.generation; index++) {
        a = require(`../data/geracao_${index}.json`).areas;
        if (index > 1) {
          a.forEach((area) => {
            const same = this.areas.findIndex((x) => x.nome === area.nome);
            if (same > -1) {
              area.pokemons.push(...this.areas[same].pokemons);
            }
          });
        }
        this.areas = a;
      }

      this.areas = this.areas.filter((a) => a.pokemons.length);
      this.legendaries = require(`../data/geracao_${this.generation}.json`).legendaries;
    },
    toggleTypes(val) {
      this.legendaryFilter = val;
      if (val) {
        this.areas = this.legendaries;
      } else {
        this.filterPokemons();
      }
    },
    getImg(name) {
      return require(`../assets/items/${name}.png`);
    },
    findPokemon() {
      this.isCatching = false;
      if (!this.selectedArea.nome) {
        alert("escolha uma regiao!");
        return;
      }
      this.fetchPoke();
    },
    fetchPoke() {
      this.loading = true;
      let idx = 0;
      let pokemon = "";

      this.avaliables = this.selectedArea.pokemons;
      console.log(this.avaliables);
      idx = Math.floor(Math.random() * this.avaliables.length);
      pokemon = this.avaliables[idx];
      if (!pokemon) return;
      this.sortPokemon(pokemon);
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
    hitPokemon() {
      const val =
        Math.floor(
          (Math.random() * this.selectedPokemon.stats[0].base_stat) / 2
        ) + 1;
      this.damageValue += val;
      const hp = this.selectedPokemon.hp - val;
      if (hp < 1) {
        alert(`Voce derrotou o Pokemon!`);
        this.damageValue = 0;
        this.selectedPokemon = {};
      }
      this.selectedPokemon = { ...this.selectedPokemon, hp };
    },
    removePokeball(pokeball) {
      this.REMOVE_PLAYER_ITEM({ pokeball, idx: this.tab });
    },
    catchPokemon(pokeball) {
      if (!this.selectedPokemon.name) return;
      this.removePokeball(pokeball);
    },

    async sortPokemon(pokemon) {
      this.damageValue = 0;
      // this.loading = true;
      // const idx = Math.floor(Math.random() * this.pokemons.length);

      try {
        let pokemonInfo2 = await Http.get(`/pokemon/${pokemon}`).then(
          (resp) => resp.data
        );
        let pokemonInfo = await Http.get(pokemonInfo2.species.url).then(
          (resp) => resp.data
        );
        let pk = { ...pokemonInfo, ...pokemonInfo2 };

        this.selectedPokemon = pk;
        this.selectedPokemon.hp = this.selectedPokemon.stats[0].base_stat;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        alert("Ocorreu um erro ao carregar o Pokemon");
      }
    },
    getDiceType(xp) {
      if (xp <= 80) return "d6";
      if (xp > 80 && xp <= 150) return "d8";
      if (xp > 150 && xp <= 259) return "d12";
      if (xp >= 260) return "d20";
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
