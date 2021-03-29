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
    updatePlayer(state, pokes) {
      debugger
      state.activePlayer.pokemons = pokes;
    },
    updateEnemy(state, pokes) {
      state.activeFighter.pokemons = pokes;
    },
    setPlayers(state, data) {
      const idx = state.savedPlayers.findIndex(s => s.progressName === data.progressName);
      idx >= 0 ? Vue.set(state.savedPlayers, idx, data) :
        state.savedPlayers.push(data)
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
    CURE_ALL({ commit }, { pks, isPlayer }) {
      isPlayer ? commit('updatePlayer', pks) : commit('updateEnemy', pks);
    },
    UPDATE_PLAYER({ commit, state }, data) {

      let pokes = state.activePlayer.pokemons
      try {
        const idx = pokes.findIndex(p => p.name === data.pokemon.name);
        pokes[idx] = data.pokemon;

        commit('updatePlayer', pokes)
      } catch (error) {
        alert(error)
      }
    },
    UPDATE_ENEMY({ commit, state }, data) {
      debugger
      let pokes = state.activeFighter.pokemons
      try {
        const idx = pokes.findIndex(p => p.name === data.pokemon.name);
        pokes[idx] = data.pokemon;
        commit('updateEnemy', pokes)
      } catch (error) {
        alert(error)
      }
    },
    SET_TYPES({ commit }, data) {
      commit('setTypes', data)
    },
    SET_PLAYERS({ commit }, data) {
      commit('setPlayers', data)
    },
    JOIN_TEAM({ commit }, data) {
      commit('joinTeam', data)
    },
  },
  modules: {},
})
