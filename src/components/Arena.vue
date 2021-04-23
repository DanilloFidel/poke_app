<template>
  <div class="area">
    <div class="bar" v-if="activeFighter.name">
      <img :src="getEnemySprite" class="enemy" />
      <b class="player-name">{{ activeFighter.name }}</b>

      <div class="enemy-pokeballs">
        <img
          class="mx-2"
          v-for="(n, idx) in filteredEnemyPokes()"
          :key="`enemy-ball-${idx}`"
          width="20px"
          :style="{
            opacity: n.isDefeated ? '0.3' : '1',
          }"
          height="20px"
          src="../assets/pokeball.svg"
        />
      </div>
    </div>
    <div class="bar" v-else>
      <v-select
        label="Líder"
        :items="gymLeaders"
        color="#6cb7f2"
        item-text="name"
        :loading="loading"
        :value="activeFighter"
        return-object
        x-small
        @change="setEnemy($event, true)"
      >
      </v-select>
    </div>

    <div class="arena" v-if="filteredEnemyPokes() && activeFighter.name">
      <div class="enemy-side side">
        <div
          v-if="filteredEnemyPokes().filter((p) => !p.isDefeated).length"
          class="pokemon"
          v-ripple
          @click="playerAttack"
        >
          <img
            :src="
              filteredEnemyPokes().filter((p) => !p.isDefeated)[0].sprites
                .front_default
            "
            alt=""
            class="img"
          />
          <div class="hit-bagde" :style="badge">{{ playerHit }}</div>
        </div>
        <div v-else>
          {{ giftPokemon.name }}
        </div>
        <div
          class="info-box ml-5"
          v-if="filteredEnemyPokes().filter((p) => !p.isDefeated).length"
        >
          <p class="overline pokemon-name">
            {{ filteredEnemyPokes().filter((p) => !p.isDefeated)[0].name }}
          </p>
          <hp-bar
            :hp="activeEnemyPokemon.hp"
            :originalHp="activeEnemyPokemon.stats[0].base_stat"
          ></hp-bar>
          <div
            v-for="(item, idx) in filteredEnemyPokes().filter(
              (p) => !p.isDefeated
            )[0].types"
            :key="idx"
          >
            <v-chip
              x-small
              outlined
              label
              class="mt-2 mr-2 overline elevation-3"
              :color="colors[item.type.name]"
              >{{ item.type.name }} -
              {{ getTypeBattle(item.type.name, "activeFighter") }}</v-chip
            ><br />
          </div>
        </div>
      </div>
      <!-- PLAYER - ENEMY -->
      <div class="player-side side">
        <div class="info-box info-box--player mr-5" v-if="activePokemon.name">
          <p class="overline pokemon-name">{{ activePokemon.name }}</p>

          <div v-for="(item, idx) in activePokemon.types" :key="idx">
            <v-chip
              x-small
              outlined
              label
              class="mt-2 mr-2 overline elevation-3"
              :color="colors[item.type.name]"
              >{{ item.type.name }} -
              {{ getTypeBattle(item.type.name, "activePokemon") }}</v-chip
            ><br />
          </div>
          <hp-bar
            class="my-2"
            :hp="activePokemon.hp"
            :originalHp="activePokemon.stats[0].base_stat"
          ></hp-bar>
          <v-btn x-small icon color="orange" @click="swipePokemon">->></v-btn>
        </div>
        <div
          v-if="activePokemon.name"
          class="pokemon pokemon-player"
          v-ripple
          @click="enemyAttack"
        >
          <div class="hit-bagde" :style="badge2">{{ enemyHit }}</div>
          <img
            :src="
              activePokemon.sprites.back_default ||
              activePokemon.sprites.front_default
            "
            class="img"
          />
        </div>
        <div v-else-if="activePlayer.pokemons">
          <v-select
            :items="
              activePlayer.pokemons.filter((p) => !p.isDefeated && p.onTeam)
            "
            item-text="name"
            return-object
            @change="setActivePlayerPoke"
            :value="activePokemon"
          >
            <template v-slot:item="{ item }">
              <b class="mr-3">{{ item.name }}</b
              ><span v-for="(type, idx) in item.types" :key="`t_${idx}`">
                <v-chip
                  x-small
                  outlined
                  label
                  class="mt-2 mr-2 overline elevation-3"
                  :color="colors[type.type.name]"
                  >{{ type.type.name }} -
                  {{
                    getTypeBattle(type.type.name, "activePokemon", item)
                  }}</v-chip
                >
              </span>
            </template></v-select
          >
        </div>
      </div>
    </div>
    <div class="bar">
      <img :src="getPlayerSprite()" class="player" />

      <div class="player-pokeballs" v-if="activePlayer.pokemons">
        <img
          class="mx-2"
          v-for="(n, idx) in activePlayer.pokemons.filter((p) => p.onTeam)"
          :key="`player-ball-${idx}`"
          width="20px"
          :style="{
            opacity: n.isDefeated ? '0.3' : '1',
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
import HpBar from "./HpBar";

// import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { mapActions, mapState } from "vuex";

export default {
  name: "ArenaComponent",
  data: () => ({
    activePokemon: {},
    playerTurn: true,
    loading: false,
    gymLeaders: [],
    playerHit: 0,
    enemyHit: "",
    enemies: [],
    activeEnemyPokemon: {},
  }),
  destroyed() {
    this.ADD_ACTIVE_FIGHTER({});
  },
  components: {
    HpBar,
  },
  computed: {
    badge() {
      return {
        opacity: !this.playerHit ? 0 : 1,
        transform: `translateY(${!this.playerHit ? 0 : -80}px)`,
      };
    },
    badge2() {
      return {
        opacity: !this.enemyHit ? 0 : 1,
        transform: `translateY(${!this.enemyHit ? 0 : -80}px)`,
      };
    },
    activeFighter() {
      return cloneDeep(this.$store.state.activeFighter);
    },
    ...mapState(["types", "savedPlayers", "pokemonToTeam", "players"]),
    giftPokemon() {
      return this.$store.state.activeFighter.pokemons[
        Math.floor(Math.random() * this.activeFighter.pokemons.length)
      ];
    },
    getEnemySprite() {
      return this.activeFighter.sprite.length
        ? require(`../assets/sprites/${this.activeFighter.sprite}`)
        : require(`../assets/enemies/${this.activeFighter.img}`);
    },
  },
  created() {
    const enemies = require("../data/leaders.json");
    this.enemies = enemies.trainers;
    this.gymLeaders = enemies.leaders;
  },
  watch: {
    activeFighter: {
      handler: function (val) {
        if (val && val.pokemons && val.pokemons.length) {
          this.activeEnemyPokemon = val.pokemons.filter(
            (p) => !p.isDefeated
          )[0];
          debugger;
          this.activeEnemyPokemon.hp = this.activeEnemyPokemon.stats[0].base_stat;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  props: ["colors", "screen", "activePlayer"],
  methods: {
    ...mapActions([
      "UPDATE_ENEMY",
      "UPDATE_PLAYER",
      "CURE_ALL",
      "UPDATE_ON_END_BATTLE",
      "SET_TYPES",
      "ADD_ACTIVE_FIGHTER",
    ]),

    getPlayerSprite() {
      let name = "";
      if (this.activePlayer.name === "Danillo") name = "player_2_sprite.gif";
      if (this.activePlayer.name === "Eduardo") name = "player_sprite.gif";
      if (this.activePlayer.name === "Matheus") name = "player_3_sprite.gif";

      return require(`../assets/sprites/${name}`);
    },
    swipePokemon() {
      if (!this.playerTurn) return;
      this.playerTurn = false;
      this.activePokemon = {};
    },
    defineAdvantage(opositeDef, isPlayer = true) {
      const objName = isPlayer ? "activePokemon" : "activeEnemyPokemon";
      if (this[objName].bonus === 2) {
        console.log("vantagem");
        return (opositeDef -= opositeDef / 2);
      } else if (this[objName].bonus === -1) {
        console.log("desvantagem");
        return (opositeDef += opositeDef / 2);
      } else return opositeDef;
    },
    playerAttack() {
      if (this.playerTurn) {
        this.playerHit = 0;

        this.playerTurn = false;
        let atk = this.activePokemon.stats[1].base_stat / 1.3;
        const attackVal = Math.floor(Math.random() * atk);
        let opositeDef = this.activeEnemyPokemon.stats[2].base_stat;
        console.log("antes da v: ", opositeDef);
        opositeDef = this.defineAdvantage(opositeDef);
        console.log("dps da v: ", opositeDef);
        const opositeDefVal = Math.floor(Math.random() * opositeDef);
        console.log("atk: ", attackVal);
        console.log("def: ", opositeDefVal);
        const hit = attackVal - opositeDefVal;
        if (hit > 0) {
          this.playerHit = hit;
          this.activeEnemyPokemon = {
            ...this.activeEnemyPokemon,
            hp: (this.activeEnemyPokemon.hp -= hit),
          };
          setTimeout(() => {
            this.playerHit = 0;
          }, 1500);
          if (this.activeEnemyPokemon.hp <= 0) {
            const pokemon = {
              ...this.activePokemon,
              wins: this.activePokemon.wins ? this.activePokemon.wins + 1 : 1,
            };
            this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon });
            setTimeout(() => {
              this.setNextEnemyPoke();
            }, 2500);
          }
        } else {
          this.playerHit = 0;
          console.log("defendeu");
        }
      }
    },
    setNextEnemyPoke() {
      const firstPoke = this.activeFighter.pokemons.filter(
        (p) => !p.isDefeated
      )[0];
      firstPoke.isDefeated = true;
      firstPoke.hp = this.activeEnemyPokemon.stats[0].base_stat;
      this.UPDATE_ENEMY({ pokemon: firstPoke });
      if (!this.activeFighter.pokemons.every((p) => p.isDefeated)) {
        const next = this.activeFighter.pokemons.filter(
          (p) => !p.isDefeated
        )[0];
        this.activeEnemyPokemon = { ...next, hp: next.stats[0].base_stat };
      }
    },
    enemyAttack() {
      if (!this.playerTurn) {
        this.enemyHit = 0;
        this.playerTurn = true;
        let atk = this.activeEnemyPokemon.stats[1].base_stat / 1.3;
        const attackVal = Math.floor(Math.random() * atk);
        let opositeDef = this.activePokemon.stats[2].base_stat;
        opositeDef = this.defineAdvantage(opositeDef, false);

        const opositeDefVal = Math.floor(Math.random() * opositeDef);
        console.log("atk: ", attackVal);
        console.log("def: ", opositeDefVal);
        const hit = attackVal - opositeDefVal;
        if (hit > 0) {
          this.enemyHit = hit;

          this.activePokemon = {
            ...this.activePokemon,
            hp: (this.activePokemon.hp -= hit),
          };
          setTimeout(() => {
            this.enemyHit = 0;
          }, 1500);
          if (this.activePokemon.hp <= 0) {
            const pokemon = {
              ...this.activePokemon,
              isDefeated: true,
            };
            debugger;
            this.UPDATE_PLAYER({ name: this.activePlayer.name, pokemon });
            setTimeout(() => {
              this.activePokemon = {};
            }, 2500);
          }
        } else {
          this.enemyHit = 0;

          console.log("defendeu");
        }
      }
    },
    setEnemy(val, isLeader) {
      console.log(val);
      console.log(isLeader);
      const lasts = 6 - val.pokemons.length;
      let calls2 = [];
      this.loading = true;

      Http.get(`type/${val.type}`)
        .then((resp) => resp.data.pokemon)
        .then((pokemonsByType) => {
          for (let index = 0; index < lasts; index++) {
            const p =
              pokemonsByType[Math.floor(Math.random() * pokemonsByType.length)];
            calls2.push(Http.get(p.pokemon.url));
          }
          let calls = [];
          val.pokemons.forEach((p) => {
            calls.push(Http.get(`/pokemon/${p}`));
          });

          Promise.allSettled([...calls, ...calls2])
            .then((resp) => {
              return resp.filter((p) => p.status === "fulfilled");
            })
            .then((resp) => {
              return resp.map((p) => p.value.data);
            })
            .then((pokemons) => {
              this.ADD_ACTIVE_FIGHTER({ ...val, pokemons });
            })
            .finally(() => (this.loading = false));
        })
        .catch(() => (this.loading = false));
    },
    filteredEnemyPokes() {
      if (!this.activeFighter.name) return [];
      let pokemons = [...this.activeFighter.pokemons];
      let qtd = 6;
      const xp = this.activePlayer.pokemons.reduce(
        (acc, el) => (acc += el.base_experience),
        0
      );
      if (xp <= 300) qtd = 3;
      else if (xp <= 650) qtd = 4;
      else if (xp <= 900) qtd = 4;
      else if (xp <= 1000) qtd = 5;
      else if (xp <= 1500) qtd = 6;
      return pokemons.splice(0, qtd);
    },

    setActivePlayerPoke(val) {
      val.hp = val.stats[0].base_stat;
      this.activePokemon = val;
    },

    getTypeBattle(type_player_poke, active, poke = this.activePokemon) {
      const pokeName =
        active === "activeFighter" ? "activeEnemyPokemon" : "activePokemon";
      if (!poke.types || !this.activeEnemyPokemon) return "N/A";
      const isFromEnemy = active === "activeFighter";
      let adversaryTypes = [];

      if (isFromEnemy) {
        adversaryTypes = poke.types.map((t) => t.type.name);
      } else {
        adversaryTypes = this.activeEnemyPokemon.types.map((t) => t.type.name);
      }

      let typesInfo = this.types.filter((t) => adversaryTypes.includes(t.name));
      let typesWins = typesInfo.map((t) =>
        t.damage_relations.double_damage_to.map((x) => x.name)
      );

      let typesLoses = typesInfo.map((t) =>
        t.damage_relations.double_damage_from.map((x) => x.name)
      );

      if (
        typesLoses.flat().includes(type_player_poke) &&
        !typesWins.flat().includes(type_player_poke)
      ) {
        this[pokeName].bonus = 2;
        return "W";
      } else if (
        !typesLoses.flat().includes(type_player_poke) &&
        !typesWins.flat().includes(type_player_poke)
      ) {
        this[pokeName].bonus = 0;
        return "E";
      } else if (
        !typesLoses.flat().includes(type_player_poke) &&
        typesWins.flat().includes(type_player_poke)
      ) {
        this[pokeName].bonus = -1;
        return "L";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.area {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 100px);
}

.enemy-side {
  margin-left: 10px;
}

.player-side {
  justify-content: flex-end;
  margin-right: 10px;
}

.side {
  display: flex;
  align-items: center;
  height: 50%;
}

.hit-bagde {
  position: absolute;
  transition: transform 2s ease-in;
  color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bolder;
}

.hp-bar {
  width: 150px;
  height: 10px;
  background-color: grey;
  border-radius: 5px;
  position: unset !important;
}

.pokemon {
  &-player {
    flex-direction: row-reverse;
  }
  &-name {
    font-size: 18px;
    // position: absolute;
    // left: 0;
  }
  justify-content: flex-start;
  display: flex;
}

.img {
  // height: 150px;
  max-height: 180px;
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

.info-box {
  &--player {
    align-self: self-start;
    padding-left: 10%;
  }
}

.player-name {
  margin: auto;
}

.player {
  left: 25px;
  height: 140px;
  position: absolute;
  bottom: 10px;
  &-pokeballs {
    width: 167px;
    display: flex;
    bottom: 40px;
    position: absolute;
    right: 60px;
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
  }
}
</style>