<template>
  <div>
    <v-row dense align="center" class="pa-2">
      <v-col cols="6" align-self="end">
        <v-btn
          small
          class="my-2"
          color="#fca838"
          @click="sortEnemy"
          :disabled="loading"
          >Sortear Inimigo</v-btn
        >
        <v-btn
          small
          class="my-2"
          color="#6cb7f2"
          :disabled="loading"
          @click="showLeaders = true"
          >Líder de Ginásio</v-btn
        >
      </v-col>
      <v-col cols="6" v-if="showLeaders">
        <v-select
          label="Líder"
          :items="gymLeaders"
          :loading="loading"
          color="#6cb7f2"
          item-text="name"
          return-object
          @change="setLeader"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row
      dense
      justify="center"
      v-if="sortedEnemy.name && sortedEnemy.pokemons.some((p) => p.name)"
    >
      <v-col cols="3" class="text-center">
        <h3>{{ sortedEnemy.name }}</h3></v-col
      >
      <v-col>
        <vue-flip active-click height="300px" width="360px">
          <template v-slot:front>
            <div
              class="card d-flex justify-center elevation-4 align-center px-2"
              v-ripple
            >
              <img
                :src="sortedEnemy.img"
                width="inherit"
                height="250px"
                alt=""
              />
            </div>
          </template>
          <template v-slot:back>
            <div
              class="card d-flex justify-center elevation-4 align-center px-2"
              v-ripple
            >
              <v-row dense>
                <v-col
                  cols="6"
                  class="d-flex align-center"
                  v-for="(pokemon, i) in sortedEnemy.pokemons"
                  :key="i"
                >
                  <img
                    height="50px"
                    width="50px"
                    :src="pokemon.sprites.front_default"
                  />
                  <div>
                    <span class="overline">{{ pokemon.name }}</span>
                    <div>
                      <v-chip
                        class="mx-2 chip overline"
                        x-small
                        v-for="(item, idx) in pokemon.types"
                        :key="`type-${idx}`"
                        :color="colors[item.type.name]"
                        >{{ item.type.name }}</v-chip
                      >
                    </div>
                  </div></v-col
                >
              </v-row>
            </div>
          </template>
        </vue-flip>
        <v-row
          v-if="sortedEnemy.name && sortedEnemy.pokemons.some((p) => p.name)"
          justify="center"
          class="mt-2"
        >
          <v-col cols="8" class="d-flex justify-center">
            <img
              v-for="(pokemon, i) in sortedEnemy.pokemons"
              @click="setPokemonStatus(pokemon, i)"
              :key="`ball-${i}`"
              width="25px"
              :style="{
                opacity: pokemon.defeated ? '0.3' : '1',
              }"
              class="mx-2"
              height="25px"
              src="../assets/pokeball.svg"
              alt=""
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row dense justify="center" style="height: 400px" v-else
      ><v-col cols="6" class="d-flex justify-center align-center">
        <h3 class="overline">
          Hora da batalha, escolha o adversário através das opções acima
        </h3></v-col
      ></v-row
    >
  </div>
</template>

<script>
import VueFlip from "vue-flip";
import Http from "../plugins/http";
import Vue from "vue";
export default {
  name: "EnemyComponent",
  data: () => ({
    loading: false,
    sortedEnemy: {},
    enemies: [],
    showLeaders: false,
    gymLeaders: [
      {
        name: "Brock",
        pokemons: [95, 74, 42, 185, 764],
        type: "Pedra",
        bagde: "da Rocha",
        img: require("../assets/enemies/brock.png"),
      },
      {
        name: "Misty",
        pokemons: [120, 54, 222, 130, 118],
        type: "Água",
        bagde: "da Cascata",
        img: require("../assets/enemies/misty.png"),
      },
      {
        name: "Chuck",
        pokemons: [57, 62, 68, 237, 106],
        type: "Lutador",
        bagde: "da Tempestade",
        img: require("../assets/enemies/chuck.png"),
      },
      {
        name: "Clair",
        pokemons: [147, 130, 230, 621, 149],
        type: "Dragão",
        bagde: "da Ascensão",
        img: require("../assets/enemies/clair.png"),
      },
      {
        name: "Erika",
        pokemons: ["tangela", "weepinbell", "gloom", "exeggcute", "bellsprout"],
        type: "Planta",
        bagde: "do Arco-Íris",
        img: require("../assets/enemies/erika.png"),
      },
      {
        name: "Morty",
        pokemons: ["gengar", "gastly", "haunter", "misdreavus", "cofagrigus"],
        type: "Fantasma",
        bagde: "da Névoa",
        img: require("../assets/enemies/morty.jpg"),
      },
      {
        name: "Falkner",
        pokemons: ["hoothoot", "dodrio", "pidgeot", "swellow", "staraptor"],
        type: "Voador",
        bagde: "do Zéfiro",
        img: require("../assets/enemies/falkner.jpg"),
      },
      {
        name: "Flannery",
        pokemons: ["magcargo", "torkoal", "slugma", "vulpix"],
        type: "Fogo",
        bagde: "do Calor",
        img: require("../assets/enemies/flanery.png"),
      },
      {
        name: "Giovanni",
        pokemons: ["persian", "nidorino", "tauros", "moltres", "mewtwo"],
        type: "Terra",
        bagde: "da Terra",
        img: require("../assets/enemies/giovanni.png"),
      },
      {
        name: "Pryce",
        pokemons: ["dewgong", "piloswine", "lapras", "articuno", "quagsire"],
        type: "Gelo",
        bagde: "da Geleira",
        img: require("../assets/enemies/pryce.png"),
      },
      {
        name: "Sargento Surge",
        pokemons: [
          "raichu",
          "electrode",
          "magneton",
          "electabuzz",
          "manectric",
        ],
        type: "Elétrico",
        bagde: "do Trovão",
        img: require("../assets/enemies/st_surge.png"),
      },
      {
        name: "Tate e Liza",
        pokemons: ["claydol", "xatu", "lunatone", "slowking", "gallade"],
        type: "Psíquico",
        bagde: "da Mente",
        img: require("../assets/enemies/tate_and_liza.png"),
      },
    ],
  }),
  props: ["colors"],
  components: {
    VueFlip,
  },
  methods: {
    sortEnemy() {
      this.showLeaders = false;
      //   this.sortedEnemy = this.enemies[
      //     Math.floor(Math.random() * this.enemies.length)
      //   ];
    },
    setPokemonStatus(pokemon, idx) {
      Vue.set(this.sortedEnemy.pokemons, idx, {
        ...pokemon,
        defeated: !pokemon.defeated,
      });
    },
    setLeader(leader) {
      this.loading = true;
      if (!leader.pokemons.some((p) => p.name)) {
        const calls = leader.pokemons.map((p) => Http.get(`/pokemon/${p}`));
        Promise.allSettled(calls)
          .then((resp) => resp.filter((p) => p.status === "fulfilled"))
          .then((resp) => resp.map((p) => p.value.data))
          .then((pokemons) => {
            this.sortedEnemy = { ...leader, pokemons };
          })
          .finally(() => (this.loading = false));
      } else {
        this.loading = false;
        this.sortedEnemy = leader;
      }
    },
  },
};
</script>

<style scoped>
.card {
  height: 300px;
  width: 360px;
}

.chip {
  font-size: 10px;
  color: white;
  width: 95px;
  max-width: 95px;
}
</style>