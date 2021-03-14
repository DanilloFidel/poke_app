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
        <vue-flip active-click height="300px" width="300px">
          <template v-slot:front>
            <div
              class="card d-flex justify-center elevation-4 align-center px-2"
              v-ripple
            >
              <img
                :src="require(`../assets/enemies/${sortedEnemy.img}`)"
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
                <v-col class="d-flex align-center justify-center">
                  <img
                    height="150px"
                    width="150px"
                    :src="
                      sortedEnemy.activePokemon.sprites.other[
                        'official-artwork'
                      ].front_default
                    "
                  />
                  <div class="mr-3">
                    <span class="overline">{{
                      sortedEnemy.activePokemon.name
                    }}</span>
                    <div>
                      <v-chip
                        class="chip overline"
                        x-small
                        v-for="(item, idx) in sortedEnemy.activePokemon.types"
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
          dense
        >
          <v-col cols="8" class="d-flex justify-center">
            <img
              v-for="(pokemon, i) in sortedEnemy.pokemons"
              @click="previouslyIsDefeated(i) && setPokemonStatus(pokemon, i)"
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
        <!-- <v-row class="mx-2">
          <span>{{
            `${sortedEnemy.name} batalha com um dados de ${sortedEnemy.dice} lados`
          }}</span>
        </v-row> -->
        <v-row
          class="mx-2"
          v-if="!sortedEnemy.pokemons.some((p) => !p.defeated)"
        >
          <span>{{
            `Você ganhou o ${giftPokemon.name} do ${sortedEnemy.name}`
          }}</span>
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
    diceType: 6,
    showLeaders: false,
  }),
  computed: {
    diceImg() {
      return require(`../assets/d${this.diceType}.svg`);
    },
    giftPokemon() {
      return this.sortedEnemy.pokemons[
        Math.floor(Math.random() * this.sortedEnemy.pokemons.length)
      ];
    },
  },
  created() {
    const enemies = require("../data/leaders.json");
    this.enemies = enemies.trainers;
    this.gymLeaders = enemies.leaders;
  },
  props: ["colors"],
  components: {
    VueFlip,
  },
  methods: {
    sortEnemy() {
      this.showLeaders = false;
      const sorted = this.enemies[
        Math.floor(Math.random() * this.enemies.length)
      ];
      this.setLeader(sorted);
    },
    setNextPokemon(idx) {
      const next = this.sortedEnemy.pokemons[idx];
      if (!next) return;
      this.sortedEnemy = { ...this.sortedEnemy, activePokemon: next };
    },
    setPokemonStatus(pokemon, idx) {
      Vue.set(this.sortedEnemy.pokemons, idx, {
        ...pokemon,
        defeated: !pokemon.defeated,
      });
      this.setNextPokemon(idx + 1);
    },
    previouslyIsDefeated(idx) {
      const pk = this.sortedEnemy.pokemons[idx - 1];
      return (pk && pk.defeated) || idx === 0;
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
            this.setNextPokemon(0);
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
  width: 300px;
}

.defeated-trainer {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  10% {
    opacity: 0.8;
  }

  30% {
    opacity: 0.7;
  }

  60% {
    opacity: 0.6;
  }

  80% {
    opacity: 0.4;
  }

  90% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.1;
  }
}

.chip {
  font-size: 10px;
  color: white;
  width: 95px;
  max-width: 95px;
}
</style>
