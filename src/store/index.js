import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    activeFighter: {},
    types: [],
    savedPlayers: []
  },
  mutations: {
    setActiveFighter(state, data) {
      state.activeFighter = data;
    },
    setPlayers(state, data) {
      state.savedPlayers = data;
    },
    setTypes(state, data) {
      state.types = data;
    },
  },
  actions: {
    ADD_ACTIVE_FIGHTER({ commit }, data) {
      commit("setActiveFighter", data)
    },
    SET_TYPES({ commit }, data) {
      commit("setTypes", data)
    },
    SET_PLAYERS({ commit }, data) {
      commit("setPlayers", data)
    }
  },
  modules: {
  }
})
