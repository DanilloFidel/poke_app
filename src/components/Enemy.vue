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
          x-small
          >Sortear Inimigo</v-btn
        >
        <v-btn
          small
          class="my-2"
          color="#6cb7f2"
          :disabled="loading"
          x-small
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
          v-model="selectedLeader"
          return-object
          x-small
          @change="setLeader($event, true)"
        >
        </v-select>
        <v-btn
          small
          class="my-2"
          color="#6cb7f2"
          :disabled="loading"
          @click="setLeader(selectedLeader, true)"
          >restaurar</v-btn
        >
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

      <div class="row d-flex align-center justify-center mt-5">
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
                  sortedEnemy.activePokemon.sprites.other['official-artwork']
                    .front_default
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
                  <p>
                    {{ diceUse(sortedEnemy.activePokemon.base_experience) }}
                  </p>
                </div>
              </div></v-col
            >
          </v-row>
        </div>
      </div>

      <v-row
        v-if="sortedEnemy.name && sortedEnemy.pokemons.some((p) => p.name)"
        justify="center"
        class="mt-5"
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
      <v-row class="mx-2" v-if="!sortedEnemy.pokemons.some((p) => !p.defeated)">
        <span
          >{{ `${sortedEnemy.name} te presenteou com: `
          }}<b>{{ giftPokemon.name }}</b></span
        >
      </v-row>
    </v-row>
    <v-row dense justify="center" style="height: 300px" v-else
      ><v-col cols="6" class="d-flex justify-center align-center">
        <h3 class="overline">
          Hora da batalha, escolha o adversário através das opções acima
        </h3></v-col
      ></v-row
    >
  </div>
</template>

<script>
import Http from "../plugins/http";
import Vue from "vue";
import { mapActions, mapState } from "vuex";
export default {
  name: "EnemyComponent",
  data: () => ({
    loading: false,
    sortedEnemy: {},
    enemies: [],
    diceType: 6,
    showLeaders: false,
    selectedLeader: {},
  }),
  computed: {
    diceImg() {
      return require(`../assets/d${this.diceType}.svg`);
    },
    ...mapState(["activePlayer"]),
    giftPokemon() {
      return this.sortedEnemy.pokemons[
        Math.floor(Math.random() * this.sortedEnemy.pokemons.length)
      ];
    },
  },
  watch: {
    sortedEnemy: {
      handler: function (val) {
        this.ADD_ACTIVE_FIGHTER(val);
      },
      deep: true,
    },
  },
  created() {
    const enemies = require("../data/leaders.json");
    this.enemies = enemies.trainers;
    this.gymLeaders = enemies.leaders;
  },
  props: ["colors"],
  methods: {
    ...mapActions(["ADD_ACTIVE_FIGHTER"]),
    diceUse(xp) {
      let diceType = "d6";
      if (xp >= 120) {
        diceType = "d8";
      }
      if (xp >= 170) {
        diceType = "d10";
      }
      if (xp >= 200) {
        diceType = "d12";
      }
      return diceType;
    },
    sortEnemy() {
      this.showLeaders = false;
      const sorted = this.enemies[
        Math.floor(Math.random() * this.enemies.length)
      ];
      this.setLeader(sorted, false);
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
    restoreEnemy(enemy) {
      this.setLeader(enemy, true);
    },
    defeatePokemon(pokemon) {
      const idx = this.sortedEnemy.pokemons.findIndex(
        (p) => p.name === pokemon
      );
      let item = this.sortedEnemy.pokemons[idx];
      this.setPokemonStatus(item, idx);
    },
    previouslyIsDefeated(idx) {
      const pk = this.sortedEnemy.pokemons[idx - 1];
      return (pk && pk.defeated) || idx === 0;
    },
    getRandomPokes() {
      return new Promise((resolve) => {
        Http.get("pokemon?limit=1118").then((resp) => {
          let pks = resp.data.results;
          const p1 = pks[Math.floor(Math.random() * pks.length)];
          pks = pks.filter((p) => p !== p1);
          const p2 = pks[Math.floor(Math.random() * pks.length)];
          pks = pks.filter((p) => p !== p2);
          const p3 = pks[Math.floor(Math.random() * pks.length)];
          pks = pks.filter((p) => p !== p3);
          const p4 = pks[Math.floor(Math.random() * pks.length)];
          pks = pks.filter((p) => p !== p4);
          const p5 = pks[Math.floor(Math.random() * pks.length)];
          pks = pks.filter((p) => p !== p5);
          const p6 = pks[Math.floor(Math.random() * pks.length)];
          resolve([p1.name, p2.name, p3.name, p4.name, p5.name, p6.name]);
        });
      });
    },
    setLeader(leader, isGymLeader) {
      this.loading = true;
      if (!leader.pokemons.some((p) => p.name)) {
        // if (this.sortedEnemy.isPlayer) {
        //   this.setPlayerAsEnemy();
        //   this.setNextPokemon(0);
        //   this.loading = false;
        //   return;
        // }
        if (!isGymLeader) {
          this.getRandomPokes().then((pokes) => {
            const calls = pokes.map((p) => Http.get(`/pokemon/${p}`));
            Promise.allSettled(calls)
              .then((resp) => {
                return resp.filter((p) => p.status === "fulfilled");
              })
              .then((resp) => {
                return resp.map((p) => p.value.data);
              })
              .then((pokemons) => {
                const poks = pokemons;

                this.sortedEnemy = { ...leader, pokemons: poks };

                this.setNextPokemon(0);
              })
              .finally(() => (this.loading = false));
          });
        } else {
          Http.get(`type/${leader.type}`)
            .then((resp) => resp.data.pokemon)
            .then((pokemonsByType) => {
              const p1 =
                pokemonsByType[
                  Math.floor(Math.random() * pokemonsByType.length)
                ];
              const p2 =
                pokemonsByType[
                  Math.floor(Math.random() * pokemonsByType.length)
                ];
              const p3 =
                pokemonsByType[
                  Math.floor(Math.random() * pokemonsByType.length)
                ];
              leader.pokemons[2] = p1.pokemon.url;
              leader.pokemons[3] = p2.pokemon.url;
              leader.pokemons[4] = p3.pokemon.url;

              let calls = leader.pokemons.map((p) =>
                p.length && p.includes("http")
                  ? Http.get(p)
                  : Http.get(`/pokemon/${p}`)
              );
              Promise.allSettled(calls)
                .then((resp) => {
                  return resp.filter((p) => p.status === "fulfilled");
                })
                .then((resp) => {
                  return resp.map((p) => p.value.data);
                })
                .then((pokemons) => {
                  const poks = isGymLeader
                    ? pokemons
                    : this.removeByExp(pokemons);
                  this.sortedEnemy = { ...leader, pokemons: poks };

                  this.setNextPokemon(0);
                })
                .finally(() => (this.loading = false));
            });
        }
      } else {
        this.loading = false;
        this.sortedEnemy = leader;
      }
    },
    setPlayerAsEnemy() {
      this.sortedEnemy = {
        img: "player.png",
        name: this.activePlayer.name,
        pokemons: this.activePlayer.pokemons.filter((p) => p.onTeam),
      };
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
