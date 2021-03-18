import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)
const diceUse = (xp) => {
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
}

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    activeFighter: {},
    activePlayer: {},
    types: [],
    savedPlayers: [],
    applyXp: {},
    pokemonToTeam: {},
    activePlayerXp: 0,
    diceBattle: {
      player: {
        type: "d6",
        value: 6,
        poke: ""
      },
      enemy: {
        type: "d6",
        value: 6,
        poke: ""
      }
    }
  },
  mutations: {
    setActiveFighter(state, data) {
      state.activeFighter = data
    },
    setActivePlayer(state, data) {
      state.activePlayer = data
    },
    setPlayers(state, data) {
      state.savedPlayers = data
    },
    setDiceBattlePlayer(state, data) {
      state.diceBattle.player = data
    },
    setDiceBattleEnemy(state, data) {
      state.diceBattle.enemy = data
    },
    setPlayerXp(state, data) {
      state.activePlayerXp = data
    },
    setTypes(state, data) {
      state.types = data
    },
    applyXp(state, data) {
      state.applyXp = data
    },
    joinTeam(state, data) {
      state.pokemonToTeam = data
    },
  },
  actions: {
    ADD_ACTIVE_FIGHTER({ commit }, data) {
      commit('setActiveFighter', data)
    },
    ADD_ACTIVE_PLAYER({ commit }, data) {
      commit('setActivePlayer', data)
    },
    SET_TYPES({ commit }, data) {
      commit('setTypes', data)
    },
    SET_PLAYER_XP({ commit }, data) {
      commit('setPlayerXp', data)
    },
    SET_PLAYERS({ commit }, data) {
      commit('setPlayers', data)
    },
    SET_SINGLE_DICE_BATTLE({ commit }, { val, name, poke }) {
      const data = { value: 6, type: diceUse(val), poke }
      name === "player" ? commit('setDiceBattlePlayer', data) : commit('setDiceBattleEnemy', data)
    },
    SET_VALUE_DICE_BATTLE({ commit, state }, { val, name }) {
      const p = state.diceBattle[name];
      const data = { value: p.value += val }
      name === "player" ? commit('setDiceBattlePlayer', { ...p, ...data }) : commit('setDiceBattleEnemy', { ...p, ...data })
    },
    SET_DICE_BATTLE({ commit, state }) {
      const enemyXp = state.activeFighter.activePokemon.base_experience;
      const poke = state.activeFighter.activePokemon.name;
      const playerData = { type: 6, value: 6 };
      const enemyData = { type: diceUse(enemyXp), value: 6, poke };
      commit('setDiceBattlePlayer', playerData)
      commit('setDiceBattleEnemy', enemyData)
    },
    APPLY_XP({ commit }, data) {
      commit('applyXp', data)
    },
    JOIN_TEAM({ commit }, data) {
      commit('joinTeam', data)
    }

  },
  modules: {},
})
