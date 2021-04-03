<template>
  <div class="area">
    <div class="bar">
      <img
        @click="restoreAll('enemy')"
        src="../assets/sprites/gary.png"
        class="enemy"
      />
      <b class="player-name" v-if="activeFighter.name">{{
        activeFighter.name
      }}</b>

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

    <div class="arena" v-if="filteredEnemyPokes()">
      <div class="enemy-side side">
        <div
          v-if="filteredEnemyPokes().filter((p) => !p.isDefeated).length"
          class="pokemon"
          v-ripple
          @click="checkPlayerHit() && rollDice('player')"
        >
          <img
            :style="{ opacity: playerDice > enemyDice ? 0.4 : 1 }"
            :src="
              filteredEnemyPokes().filter((p) => !p.isDefeated)[0].sprites
                .front_default
            "
            alt=""
            class="img"
          />
          <span>{{ enemyDice }}</span>
        </div>
        <div v-else>
          {{ giftPokemon.name }}
        </div>
        <div
          class="info-box"
          v-if="filteredEnemyPokes().filter((p) => !p.isDefeated).length"
        >
          <p class="overline pokemon-name">
            {{ filteredEnemyPokes().filter((p) => !p.isDefeated)[0].name }}
          </p>
          <p>
            Dado: D{{
              getDiceType(
                filteredEnemyPokes().filter((p) => !p.isDefeated)[0]
                  .base_experience
              )
            }}
          </p>
          <v-chip
            x-small
            outlined
            label
            class="mt-2 mr-2 overline elevation-3"
            v-for="(item, idx) in filteredEnemyPokes().filter(
              (p) => !p.isDefeated
            )[0].types"
            :key="idx"
            :color="colors[item.type.name]"
            >{{ item.type.name }} -
            {{ getTypeBattle(item, item.type.name, "activeFighter") }}</v-chip
          >
        </div>
      </div>
      <div class="player-side side">
        <div class="info-box info-box--player">
          <p class="overline pokemon-name">{{ activePokemon.name }}</p>
          <p>Dado: D{{ getDiceType(activePokemon.base_experience) }}</p>
          <v-chip
            x-small
            outlined
            label
            class="mt-2 mr-2 overline elevation-3"
            v-for="(item, idx) in activePokemon.types"
            :key="idx"
            :color="colors[item.type.name]"
            >{{ item.type.name }} -
            {{ getTypeBattle(item, item.type.name, "activePokemon") }}</v-chip
          >
        </div>
        <div
          v-if="activePokemon.name"
          class="pokemon pokemon-player"
          v-ripple
          @click="checkEnemyHit() && rollDice('enemy')"
        >
          <span>{{ playerDice }}</span>
          <img
            :style="{ opacity: playerDice < enemyDice ? 0.4 : 1 }"
            :src="activePokemon.sprites.back_default"
            class="img"
          />
        </div>
        <div v-else-if="selectedPlayer.pokemons">
          <v-select
            :items="
              selectedPlayer.pokemons
                .filter((p) => !p.isDefeated)
                .filter((p, i) => i <= 5)
            "
            item-text="name"
            return-object
            v-model="activePokemon"
          ></v-select>
        </div>
      </div>
    </div>
    <div class="bar">
      <img
        @click="restoreAll('player')"
        src="../assets/sprites/trainer.png"
        class="player"
      />
      <b v-if="selectedPlayer.name" class="player-name">{{
        selectedPlayer.name
      }}</b>
      <v-select
        v-else
        v-model="selectedPlayer"
        :items="players"
        item-text="name"
        return-object
      ></v-select>
      <div class="player-pokeballs" v-if="selectedPlayer.pokemons">
        <img
          class="mx-2"
          v-for="(n, idx) in selectedPlayer.pokemons.filter((p, i) => i <= 5)"
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
// import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { mapActions, mapState } from "vuex";

export default {
  name: "ArenaComponent",
  data: () => ({
    activePokemon: {},
    enemyHit: 0,
    playerHit: 0,
    enemyHits: 0,
    playerHits: 0,
    enemyDice: 0,
    playerDice: 0,
    loading: false,
    diceType: 6,
    enemyPokeIdx: 0,
    selectedPlayer: {},
  }),
  computed: {
    activeFighter() {
      return cloneDeep(this.$store.state.activeFighter);
    },
    ...mapState(["types", "savedPlayers", "pokemonToTeam", "players"]),
    giftPokemon() {
      return this.$store.state.activeFighter.pokemons[
        Math.floor(Math.random() * this.activeFighter.pokemons.length)
      ];
    },
    totalHits() {
      return this.enemyHits + this.playerHits;
    },
  },
  created() {
    console.log(this.$store.state);
    Http.get(`/type`)
      .then((resp) => resp.data.results.map((r) => r))
      .then((types) => {
        const calls = types.map((type) => Http.get(`/type/${type.name}`));
        Promise.all(calls)
          .then((resp) => resp.map((r) => r.data))
          .then((datas) => {
            const types = datas.filter(
              (t) => !["unknown", "shadow"].includes(t.name)
            );
            this.SET_TYPES(types);
          });
      });
  },
  watch: {
    playerHit() {
      if (this.enemyHit + this.playerHit >= this.totalHits) this.finishBattle();
    },
    enemyHit() {
      if (this.enemyHit + this.playerHit >= this.totalHits) this.finishBattle();
    },
    screen(name) {
      if (name === "arena") {
        this.resetScores();
      }
    },
    activePokemon(val) {
      console.log(val);
    },
  },
  props: ["colors", "screen"],
  methods: {
    ...mapActions([
      "UPDATE_ENEMY",
      "CURE_ALL",
      "UPDATE_ON_END_BATTLE",
      "SET_TYPES",
    ]),
    getDiceType(xp) {
      let diceType = 6;
      if (xp >= 120) {
        diceType = 8;
      }
      if (xp >= 170) {
        diceType = 10;
      }
      if (xp >= 200) {
        diceType = 12;
      }
      return diceType;
    },
    checkPlayerHit() {
      debugger;
      return this.playerHit < this.playerHits;
    },
    checkEnemyHit() {
      debugger;
      return this.enemyHit < this.enemyHits;
    },
    filteredEnemyPokes() {
      if (!this.selectedPlayer.pokemons || !this.activeFighter.pokemons) {
        return this.activeFighter.pokemons
          ? [...this.activeFighter.pokemons]
          : [];
      }

      let pokemons = [...this.activeFighter.pokemons];
      let qtd = 6;
      const xp = this.selectedPlayer.pokemons.reduce(
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
    restoreAll(name) {
      const isPlayer = name === "player";
      const pks = isPlayer
        ? this.selectedPlayer.pokemons
        : this.activeFighter.pokemons;
      pks.forEach((p) => (p.isDefeated = false));
      // let playerIdx = false;
      if (isPlayer)
        this.selectedPlayer = { ...this.selectedPlayer, pokemons: pks };
      else {
        this.CURE_ALL({ pks });
      }
    },
    finishBattle() {
      const playerWins = this.playerDice > this.enemyDice;
      if (playerWins) {
        if (!this.activeFighter.pokemons.length) {
          console.log(this.giftPokemon);
        }
        const firstPoke = this.activeFighter.pokemons.filter(
          (p) => !p.isDefeated
        )[0];
        firstPoke.isDefeated = true;
        this.UPDATE_ENEMY({ pokemon: firstPoke });
        if (this.activeFighter.pokemons.every((p) => p.isDefeated))
          this.UPDATE_ON_END_BATTLE({
            name: this.selectedPlayer.name,
            pokemons: this.selectedPlayer.pokemons,
          });
      } else {
        this.activePokemon.isDefeated = true;
        this.activePokemon = {};
        if (this.filteredEnemyPokes().every((p) => p.isDefeated))
          this.selectedPlayer = {};
      }
      this.resetScores();
    },
    getTypeBattle(poke, type_player_poke, active) {
      const hitName = active === "activeFighter" ? "enemyHits" : "playerHits";
      if (!this.activePokemon.types || !this.activeFighter.activePokemon)
        return "N/A";

      const isFromEnemy = active === "activeFighter";
      let adversaryTypes = [];

      if (isFromEnemy) {
        adversaryTypes = this.activePokemon.types.map((t) => t.type.name);
      } else {
        adversaryTypes = this.activeFighter.activePokemon.types.map(
          (t) => t.type.name
        );
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
        this[hitName] = 3;
        return "W";
      } else if (
        !typesLoses.flat().includes(type_player_poke) &&
        !typesWins.flat().includes(type_player_poke)
      ) {
        this[hitName] = 3;
        return "E";
      } else if (
        !typesLoses.flat().includes(type_player_poke) &&
        typesWins.flat().includes(type_player_poke)
      ) {
        this[hitName] = 2;
        return "L";
      }
    },
    rollDice(origin) {
      const exp =
        origin === "player"
          ? this.activePokemon.base_experience
          : this.activeFighter.pokemons.filter((p) => !p.isDefeated)[0]
              .base_experience;
      let dice = this.getDiceType(exp);
      const value = Math.floor(Math.random() * dice) + 1;
      if (origin === "player") {
        this.playerDice += value;
        this.playerHit++;
      } else {
        this.enemyHit++;
        this.enemyDice += value;
      }
    },
    resetScores() {
      console.log("restarados");
      this.enemyHit = 0;
      this.playerHit = 0;
      this.enemyDice = 0;
      this.playerDice = 0;
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