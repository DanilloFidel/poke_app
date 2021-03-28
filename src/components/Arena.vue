<template>
  <div class="area">
    <div class="bar">
      <img @click="sortEnemy" src="../assets/sprites/gary.png" class="enemy" />
      <div class="enemy-pokeballs">
        <img
          v-for="n in 6"
          :key="n"
          width="20px"
          :style="{
            opacity: false ? '0.3' : '1',
          }"
          height="20px"
          src="../assets/pokeball.svg"
        />
      </div>
    </div>

    <div class="arena"></div>
    <div class="bar">
      <img src="../assets/sprites/trainer.png" class="player" />
      <div class="player-pokeballs">
        <img
          v-for="n in 6"
          :key="n"
          width="20px"
          :style="{
            opacity: false ? '0.3' : '1',
          }"
          height="20px"
          src="../assets/pokeball.svg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Http from "../plugins/http";
import Vue from "vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "ArenaComponent",
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
      debugger;
      let item = this.sortedEnemy.pokemons[idx];
      this.setPokemonStatus(item, idx);
    },
    previouslyIsDefeated(idx) {
      const pk = this.sortedEnemy.pokemons[idx - 1];
      return (pk && pk.defeated) || idx === 0;
    },
    removeByExp(pokemons) {
      let qtd = 6;
      const xp = this.activePlayer.pokemons.reduce(
        (acc, el) => (acc += el.base_experience),
        0
      );
      console.log(xp);
      if (xp <= 300) qtd = 3;
      else if (xp <= 650) qtd = 4;
      else if (xp <= 900) qtd = 4;
      else if (xp <= 1000) qtd = 5;
      else if (xp <= 1500) qtd = 6;
      return pokemons.splice(0, qtd);
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
        if (this.sortedEnemy.isPlayer) {
          this.setPlayerAsEnemy();
          this.setNextPokemon(0);
          this.loading = false;
          return;
        }
        if (!isGymLeader) {
          this.getRandomPokes().then((pokes) => {
            const calls = pokes.map((p) => Http.get(`/pokemon/${p}`));
            Promise.allSettled(calls)
              .then((resp) => {
                debugger;
                return resp.filter((p) => p.status === "fulfilled");
              })
              .then((resp) => {
                debugger;
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
                Http.get(p.length ? p : `/pokemon/${p}`)
              );
              Promise.allSettled(calls)
                .then((resp) => {
                  debugger;
                  return resp.filter((p) => p.status === "fulfilled");
                })
                .then((resp) => {
                  debugger;
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

<style lang="scss" scoped>
.area {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 46px);
}

.arena {
  height: calc(100% - 100px);
}
.bar {
  display: flex;
  height: 50px;
  background-color: rgb(255, 219, 140);
  width: 100vw;
}

.player {
  height: 140px;
  position: absolute;
  bottom: 10px;
  &-pokeballs {
    width: 167px;
    display: flex;
    bottom: 40px;
    position: absolute;
    right: 25px;
    justify-content: space-around;
  }
}
.enemy {
  height: 120px;
  position: absolute;
  right: 10px;
  top: 50px;
  &-pokeballs {
    width: 167px;
    display: flex;
    top: 83px;
    position: absolute;
    left: 25px;
    justify-content: space-around;
  }
}
</style>