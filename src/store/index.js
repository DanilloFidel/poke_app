import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
Vue.use(Vuex)
import Player from "../models/player";

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    activeFighter: {},
    activePlayer: {},
    pokeballTypes: [
      { name: "pokeball", captureBonus: 255, img: "poke_ball" },
      { name: "greatball", captureBonus: 200, img: "great_ball" },
      { name: "ultraball", captureBonus: 150, img: "ultra_ball" },
      { name: "masterball", isMaster: true, img: "master_ball" }
    ],
    types: [],
    savedPlayers: [],
    applyXp: {},
    players: [
      new Player({ name: "Danillo" }),
      new Player({ name: "Eduardo" }),
      new Player({ name: "Matheus" })
    ],
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
      data.pokemons.forEach(poke => {
        delete poke.abilities;
        delete poke.forms;
        delete poke.species;
        delete poke.moves;
      })
      state.activeFighter = data
    },
    setActivePlayer(state, data) {
      state.activePlayer = data
    },
    setPlayers(state, data) {
      state.players = data.map(p => new Player(p))
    },
    updatePlayer(state, pokes) {
      if (!pokes || !pokes.length) return
      state.activePlayer.pokemons = pokes;
    },
    updateEnemy(state, pokes) {
      if (!pokes || !pokes.length) return
      state.activeFighter.pokemons = pokes;
    },
    saveState(state, data) {
      const idx = state.savedPlayers.findIndex(s => s.progressName === data.progressName);
      idx >= 0 ? Vue.set(state.savedPlayers, idx, data) :
        state.savedPlayers.push(data)
    },
    updatePlayersPoke(state, { idx, poke, playerIdx }) {
      delete poke.abilities;
      delete poke.forms;
      delete poke.species;
      delete poke.moves;
      Vue.set(state.players[playerIdx].pokemons, idx, poke)
    },
    updateFinishedBattle(state, { pks, playerIdx }) {
      if (pks && pks.length) {
        const p = state.players[playerIdx];
        p.pokemons = pks;
        Vue.set(state.players, playerIdx, p)
      }
    },
    removePlayersPoke(state, { idx, playerIdx }) {
      Vue.delete(state.players[playerIdx].pokemons, idx)
    },
    addPlayersPoke(state, { poke, playerIdx }) {
      state.players[playerIdx].pokemons.push(poke)
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
      if (!data || !data.name) return
      state.pokemonToTeam = data
    },
  },
  actions: {
    ADD_ACTIVE_FIGHTER({ commit }, data) {
      commit('setActiveFighter', data)
    },
    CURE_ALL({ commit }, { pks }) {
      commit('updateEnemy', pks);
    },
    UPDATE_PLAYER({ commit, state }, { name, pokemon, isEvolve, oldPokemon }) {
      const playerIdx = state.players.findIndex(p => p.name === name);
      let idx = -1;
      if (isEvolve) {
        idx = state.players[playerIdx].pokemons.findIndex(p => p.id === oldPokemon.id)

      } else {

        idx = state.players[playerIdx].pokemons.findIndex(p => p.id === pokemon.id)
      }
      commit('updatePlayersPoke', { idx, poke: pokemon, playerIdx })
    },
    ADD_POKE_TO_PLAYER({ commit }, { poke, playerIdx }) {
      commit('addPlayersPoke', { poke, playerIdx })
    },
    UPDATE_ON_END_BATTLE({ commit, state }, { name, pokemons }) {
      debugger
      const playerIdx = state.players.findIndex(p => p.name === name);
      commit('updateFinishedBattle', { poke: pokemons, playerIdx })
    },
    REMOVE_PLAYERS_POKE({ commit }, { idx, playerIdx }) {
      commit('removePlayersPoke', { idx, playerIdx })
    },
    UPDATE_ENEMY({ commit, state }, data) {

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
    SAVE_GAME({ commit }, data) {
      commit('saveState', data)
    },
    JOIN_TEAM({ commit }, data) {
      commit('joinTeam', data)
    },
    SET_PLAYERS({ commit }, data) {
      data.forEach(p => {
        p.pokemons.forEach(poke => {
          delete poke.abilities;
          delete poke.forms;
          delete poke.species;
          delete poke.moves;
        })
      })
      commit("setPlayers", data)
    }
  },
  modules: {},
})
