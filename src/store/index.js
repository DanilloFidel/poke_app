import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)
const diceUse = (xp) => {
  let diceType = 6
  if (xp >= 120) {
    diceType = 8
  }
  if (xp >= 170) {
    diceType = 10
  }
  if (xp >= 200) {
    diceType = 12
  }
  return diceType
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
    diceBattle: {
      player: {
        type: 'd6',
        value: 0,
        poke: '',
      },
      enemy: {
        type: 'd6',
        value: 0,
        poke: '',
      },
    },
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
    setTypes(state, data) {
      state.types = data
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
    SET_PLAYERS({ commit }, data) {
      commit('setPlayers', data)
    },
    SET_SINGLE_DICE_BATTLE({ commit }, { val, name, poke }) {
      const data = { value: 0, type: diceUse(val), poke }
      name === 'player'
        ? commit('setDiceBattlePlayer', data)
        : commit('setDiceBattleEnemy', data)
    },
    SET_VALUE_DICE_BATTLE({ commit, state }, { val, name }) {
      const p = state.diceBattle[name]
      const data = { value: (p.value += val) }
      name === 'player'
        ? commit('setDiceBattlePlayer', { ...p, ...data })
        : commit('setDiceBattleEnemy', { ...p, ...data })
    },
    SET_DICE_BATTLE({ commit, state }) {
      const enemyXp = state.activeFighter.activePokemon.base_experience
      const poke = state.activeFighter.activePokemon.name
      const playerData = { type: 6, value: 0 }
      const enemyData = { type: diceUse(enemyXp), value: 0, poke }
      commit('setDiceBattlePlayer', playerData)
      commit('setDiceBattleEnemy', enemyData)
    },
    JOIN_TEAM({ commit }, data) {
      commit('joinTeam', data)
    },
  },
  modules: {},
})
