import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    activeFighter: {},
    activePlayer: {},
    types: [],
    savedPlayers: [],
    applyXp: {},
    pokemonToTeam: {},
    activePlayerXp: 0
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
    APPLY_XP({ commit }, data) {
      commit('applyXp', data)
    },
    JOIN_TEAM({ commit }, data) {
      commit('joinTeam', data)
    }

  },
  modules: {},
})
