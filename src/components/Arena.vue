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
          v-for="(n, idx) in activeFighter.pokemons"
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

    <div class="arena">
      <div class="enemy-side side">
        <div
          v-if="activeFighter.pokemons.filter((p) => !p.isDefeated).length"
          class="pokemon"
          v-ripple
          @click="playerHit < 3 && rollDice('player')"
        >
          <img
            :style="{ opacity: playerDice > enemyDice ? 0.4 : 1 }"
            :src="
              activeFighter.pokemons.filter((p) => !p.isDefeated)[0].sprites
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
          v-if="activeFighter.pokemons.filter((p) => !p.isDefeated).length"
        >
          <p class="overline pokemon-name">
            {{ activeFighter.pokemons.filter((p) => !p.isDefeated)[0].name }}
          </p>
          <p>
            Dado: D{{
              getDiceType(
                activeFighter.pokemons.filter((p) => !p.isDefeated)[0]
                  .base_experience
              )
            }}
          </p>
          <v-chip
            x-small
            outlined
            label
            class="mt-2 mr-2 overline elevation-3"
            v-for="(item, idx) in activeFighter.pokemons.filter(
              (p) => !p.isDefeated
            )[0].types"
            :key="idx"
            :color="colors[item.type.name]"
            >{{ item.type.name }} - {{ getTypeBattle(item.type.name) }}</v-chip
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
            >{{ item.type.name }} - {{ getTypeBattle(item.type.name) }}</v-chip
          >
        </div>
        <div
          v-if="activePokemon.name"
          class="pokemon pokemon-player"
          v-ripple
          @click="enemyHit < 3 && rollDice('enemy')"
        >
          <span>{{ playerDice }}</span>
          <img
            :style="{ opacity: playerDice < enemyDice ? 0.4 : 1 }"
            :src="activePokemon.sprites.back_default"
            class="img"
          />
        </div>
        <div v-else>
          <v-select
            :items="
              activePlayer.pokemons
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
      <b v-if="activePlayer" class="player-name">{{ activePlayer.name }}</b>
      <div class="player-pokeballs">
        <img
          class="mx-2"
          v-for="(n, idx) in activePlayer.pokemons.filter((p, i) => i <= 5)"
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
// import Http from "../plugins/http";
// import Vue from "vue";
import cloneDeep from "lodash/cloneDeep";
import { mapActions, mapState } from "vuex";

export default {
  name: "ArenaComponent",
  data: () => ({
    activePokemon: {},
    totalHits: 6,
    enemyHit: 0,
    playerHit: 0,
    enemyDice: 0,
    playerDice: 0,
    loading: false,
    diceType: 6,
    enemyPokeIdx: 0,
  }),
  computed: {
    activePlayer() {
      return cloneDeep(this.$store.state.activePlayer);
    },
    activeFighter() {
      return cloneDeep(this.$store.state.activeFighter);
    },
    ...mapState(["types", "savedPlayers", "pokemonToTeam"]),
    giftPokemon() {
      return this.$store.state.activeFighter.pokemons[
        Math.floor(Math.random() * this.activeFighter.pokemons.length)
      ];
    },
  },
  created() {
    console.log(this.$store.state);
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
    ...mapActions(["UPDATE_ENEMY", "UPDATE_PLAYER", "CURE_ALL"]),
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
    restoreAll(name) {
      const isPlayer = name === "player";
      const pks = isPlayer
        ? this.activePlayer.pokemons
        : this.activeFighter.pokemons;
      pks.forEach((p) => (p.isDefeated = false));
      this.CURE_ALL({ pks, isPlayer });
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
      } else {
        const firstPoke = this.activePokemon;
        firstPoke.isDefeated = true;
        this.UPDATE_PLAYER({ pokemon: firstPoke });
        console.log("enemy wins");
        this.activePokemon = {};
      }
      this.resetScores();
    },
    getTypeBattle(type_player_poke) {
      if (!this.activeFighter.name) return "N/A";

      const enemyTypes = this.activeFighter.activePokemon.types.map(
        (t) => t.type.name
      );
      const enemyTypesInfo = this.types.filter((t) =>
        enemyTypes.includes(t.name)
      );
      const enemyTypesWins = enemyTypesInfo.map((t) =>
        t.damage_relations.double_damage_to.map((x) => x.name)
      );

      const enemyTypesLoses = enemyTypesInfo.map((t) =>
        t.damage_relations.double_damage_from.map((x) => x.name)
      );

      if (
        enemyTypesLoses.flat().includes(type_player_poke) &&
        !enemyTypesWins.flat().includes(type_player_poke)
      ) {
        return "W";
      } else if (
        !enemyTypesLoses.flat().includes(type_player_poke) &&
        !enemyTypesWins.flat().includes(type_player_poke)
      ) {
        return "E";
      } else if (
        !enemyTypesLoses.flat().includes(type_player_poke) &&
        enemyTypesWins.flat().includes(type_player_poke)
      ) {
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
  height: 200px;
  width: 180px;
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