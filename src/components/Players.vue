<template>
  <div>
    <v-tabs v-model="tab" centered height="30px">
      <v-tabs-slider></v-tabs-slider>

      <v-tab v-for="(player, idx) in players" :key="`player${idx}`">
        {{ player.name }}
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="(player, idx) in players"
        :key="`player_content${idx}`"
      >
        <v-card class="pa-3">
          <v-row>
            <v-col>
              <span
                >XP: <b>{{ activePlayer.xp }}</b></span
              >
            </v-col>
            <v-col>
              <v-btn x-small @click="openAddModal">Adicionar Pokemon</v-btn>
            </v-col>
            <v-col>
              <v-btn x-small icon @click="cureAll"
                ><v-icon>{{ potionIcon }}</v-icon></v-btn
              >
            </v-col>
          </v-row>

          <v-row dense style="overflow-y: auto; max-height: 350px">
            <v-col
              cols="6"
              v-for="(pokemon, idx) in onTeam"
              :key="`team_member${idx}`"
            >
              <v-card
                elevation="3"
                style="height: 155px"
                :color="pokemon.defeated ? '#ff00005c' : 'white'"
                class="pa-2"
              >
                <v-row dense justify="space-around" style="height: 87px">
                  <span style="position: absolute; left: 3px; font-size: 13px"
                    ><b> wins:</b> {{ pokemon.wins || 0 }}</span
                  >
                  <v-col cols="6" class="mt-1" @click="upPokemon(pokemon)">
                    <img
                      height="85px"
                      width="85px"
                      :src="pokemon.sprites.front_default"
                      :class="{ evolving: pokemon.isEvolving }"
                    />
                  </v-col>
                  <v-col
                    cols="6"
                    align-self="center"
                    class="pl-2"
                    style="font-size: 12px"
                  >
                    <span class="text-capitalize"
                      ><b>{{ pokemon.name }}</b>
                    </span>
                    <br />
                    <span class="text-capitalize">
                      {{ diceUse(pokemon.base_experience) }}</span
                    >
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col class="pa-0"
                    ><v-chip
                      x-small
                      outlined
                      label
                      class="mt-2 mr-2 overline elevation-3"
                      v-for="(item, idx) in pokemon.types"
                      :key="idx"
                      :color="colors[item.type.name]"
                      >{{ item.type.name }} -
                      {{ getTypeBattle(item.type.name) }}</v-chip
                    ></v-col
                  >
                </v-row>
                <v-btn icon absolute style="right: 25px; top: 0">
                  <v-icon
                    style="font-size: 8px"
                    @click.stop="changePokemonStatus(pokemon)"
                    >{{ defeatedIcon }}</v-icon
                  >
                </v-btn>
                <v-btn icon absolute style="right: 0px; top: 0">
                  <v-icon
                    style="font-size: 8px"
                    @click.stop="moveTeam(pokemon, false)"
                    >{{ closeIcon }}</v-icon
                  >
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <v-card-title class="py-1">Box</v-card-title>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="(item, i) in activePlayer.pokemons.filter(
                    (p) => !p.onTeam
                  )"
                  :key="`${item} - ${i}`"
                  @dblclick="removePokemon(item)"
                >
                  <td @click="moveTeam(item)">
                    {{ item.name }}
                  </td>
                  <td>
                    <span
                      class="mr-1 overline"
                      v-for="(item_2, idx) in item.types"
                      :key="idx"
                      :style="{
                        color: `${colors[item_2.type.name]}`,
                      }"
                      >{{ item_2.type.name }}</span
                    >
                  </td>
                  <td>
                    <span>{{ diceUse(item.base_experience) }}</span>
                  </td>
                  <td>
                    <v-btn x-small icon @click="removePokemon(item)"
                      ><v-icon>{{ closeIcon }}</v-icon></v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="addMenu">
      <v-card class="pa-3">
        <v-row dense>
          <v-autocomplete
            label="Nome"
            :items="pokemons"
            item-text="name"
            item-value="name"
            @change="closeAndAdd"
          ></v-autocomplete>
        </v-row>
      </v-card>
    </v-dialog>

    <v-btn absolute bottom right x-small @click="saveProgress"
      >Salvar partida</v-btn
    >
  </div>
</template>

<script>
import { mdiClose } from '@mdi/js'
import { mdiEmoticonDeadOutline } from '@mdi/js'
import { mdiBottleTonicPlus } from '@mdi/js'
import Http from '../plugins/http'

import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
export default {
  data: () => ({
    closeIcon: mdiClose,
    defeatedIcon: mdiEmoticonDeadOutline,
    potionIcon: mdiBottleTonicPlus,
    tab: 0,
    addMenu: false,
    pokemons: [],
    players: [
      {
        name: 'Danillo',
        xp: 0,
        pokemons: [],
      },
      {
        name: 'Eduardo',
        xp: 0,
        pokemons: [],
      },
    ],
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: 'Pokemons',
        align: 'start',
        sortable: false,
        value: 'name',
      },
      { text: 'Tipo', value: 'type' },
    ],
  }),
  computed: {
    activePlayer() {
      return this.players[this.tab]
    },
    ...mapState([
      'activeFighter',
      'types',
      'savedPlayers',
      'applyXp',
      'pokemonToTeam',
    ]),
    onTeam() {
      return this.activePlayer.pokemons.filter((p) => p.onTeam)
    },
  },
  watch: {
    applyXp(obj) {
      obj.val && this.setXp(obj.val, obj.win)
    },
    pokemonToTeam(obj) {
      obj.name && this.activePlayer.pokemons.push(obj)
    },
    tab(val) {
      val !== null && val !== undefined && this.ADD_ACTIVE_PLAYER(this.players[val])
    },
  },
  props: ['colors'],
  created() {
    Http.get('pokemon?limit=1118').then(
      (resp) => (this.pokemons = resp.data.results)
    )
  },
  methods: {
    ...mapActions(['SET_PLAYERS', 'SET_PLAYER_XP', "ADD_ACTIVE_PLAYER"]),
    removePokemon(item) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      )
      this.setXp(item.base_experience, false)
      Vue.delete(this.activePlayer.pokemons, idx)
    },
    moveTeam(pk, add = true) {
      const teamLength = this.activePlayer.pokemons.filter((p) => p.onTeam)
        .length
      const idx = this.activePlayer.pokemons.findIndex((p) => p.id === pk.id)
      const canAdd = teamLength < 6
      let poke = {}
      if (!add) {
        poke = { ...pk, onTeam: false }
      } else {
        poke = { ...pk, onTeam: canAdd ? !pk['onTeam'] : false }
      }
      Vue.set(this.activePlayer.pokemons, idx, poke)
    },
    saveProgress() {
      this.SET_PLAYERS(this.players)
    },
    load() {
      if (this.savedPlayers.length) this.players = [...this.savedPlayers]
    },
    diceUse(xp) {
      let diceType = 'd6'
      if (xp >= 120) {
        diceType = 'd8'
      }
      if (xp >= 170) {
        diceType = 'd10'
      }
      if (xp >= 200) {
        diceType = 'd20'
      }
      return diceType
    },
    getTypeBattle(type_player_poke) {
      if (!this.activeFighter.name) return 'N/A'

      const enemyTypes = this.activeFighter.activePokemon.types.map(
        (t) => t.type.name
      )
      const enemyTypesInfo = this.types.filter((t) =>
        enemyTypes.includes(t.name)
      )
      const enemyTypesWins = enemyTypesInfo.map((t) =>
        t.damage_relations.double_damage_to.map((x) => x.name)
      )

      const enemyTypesLoses = enemyTypesInfo.map((t) =>
        t.damage_relations.double_damage_from.map((x) => x.name)
      )

      if (
        enemyTypesLoses.flat().includes(type_player_poke) &&
        !enemyTypesWins.flat().includes(type_player_poke)
      ) {
        return 'W'
      } else if (
        !enemyTypesLoses.flat().includes(type_player_poke) &&
        !enemyTypesWins.flat().includes(type_player_poke)
      ) {
        return 'E'
      } else if (
        !enemyTypesLoses.flat().includes(type_player_poke) &&
        enemyTypesWins.flat().includes(type_player_poke)
      ) {
        return 'L'
      }
    },
    sortInitials() {
      this.players = []
      this.players = [
        {
          name: 'Danillo',
          xp: 0,
          pokemons: [],
        },
        {
          name: 'Eduardo',
          xp: 0,
          pokemons: [],
        },
      ]

      let starters = [
        'charmander',
        'squirtle',
        'bulbasaur',
        'totodile',
        'chikorita',
        'cyndaquil',
        'treecko',
        'torchic',
        'mudkip',
        'turtwig',
        'chimchar',
        'piplup',
        'chespin',
        'fennekin',
        'froakie',
        'rowlet',
        'litten',
        'popplio',
        'grookey',
        'scorbunny',
        'sobble',
      ]

      this.players.forEach((p) => {
        const p1 = starters[Math.floor(Math.random() * starters.length)]
        starters = starters.filter((p) => p !== p1)
        const p2 = starters[Math.floor(Math.random() * starters.length)]
        starters = starters.filter((p) => p !== p2)
        const p3 = starters[Math.floor(Math.random() * starters.length)]

        const sorted = [p1, p2, p3]
        const promisses = []
        sorted.forEach((poke) => {
          promisses.push(Http.get(`pokemon/${poke}`))
        })

        Promise.allSettled(promisses)
          .then((resp) => {
            return resp.map((r) => {
              const pk = r.value.data
              pk['onTeam'] = true
              return pk
            })
          })
          .then((pokes) => (p.pokemons = pokes))
      })
    },
    changePokemonStatus(item, cure) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      )
      item.defeated = cure ? false : !item.defeated
      Vue.set(this.activePlayer.pokemons, idx, item)
    },
    upPokemon(pokemon) {
      if (pokemon.isEvolving || pokemon.defeated) return
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === pokemon.name
      )
      pokemon.wins = pokemon.wins ? pokemon.wins + 1 : 1
      Vue.set(this.activePlayer.pokemons, idx, pokemon)
      if (pokemon.wins == 14 || pokemon.wins == 26) {
        this.evolvePokemon(pokemon)
      }
    },
    setEvolveEffect(idx, pokemon, evolving) {
      pokemon['isEvolving'] = evolving
      Vue.set(this.activePlayer.pokemons, idx, pokemon)
    },
    evolvePokemon(pokemon) {
      if (pokemon.name === 'eevee') return
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === pokemon.name
      )

      this.setEvolveEffect(idx, pokemon, true)

      try {
        Http.get(`/pokemon-species/${pokemon.name}`)
          .then((resp) => resp.data.evolution_chain)
          .then((data) => {
            Http.get(data.url)
              .then((resp) => {
                return resp.data.chain
              })
              .then((chain) => {
                if (chain.evolves_to.length) {
                  let evol = chain.evolves_to[0]

                  if (
                    evol.species.name === pokemon.name &&
                    evol.evolves_to.length
                  ) {
                    evol = evol.evolves_to[0]
                  }

                  Http.get(evol.species.url).then((resp) => {
                    Http.get(`pokemon/${resp.data.name}`)
                      .then((resp) => {
                        this.replaceEvoluted(resp.data, idx, pokemon)
                      })
                      .finally(() => (this.isEvolving = false))
                  })
                }
              })
          })
      } catch (error) {
        this.setEvolveEffect(idx, pokemon, false)
      }
    },
    replaceEvoluted(pokemon, idx, oldPokemon) {
      pokemon['onTeam'] = oldPokemon.onTeam
      pokemon['wins'] = oldPokemon.wins
      pokemon['defeated'] = oldPokemon.defeated
      Vue.set(this.activePlayer.pokemons, idx, pokemon)
    },
    openAddModal() {
      this.addMenu = !this.addMenu
    },
    closeAndAdd(name) {
      this.addMenu = false
      Http.get(`pokemon/${name}`).then((resp) => {
        this.activePlayer.pokemons.push(resp.data)
        this.setXp(resp.data.base_experience, true)
      })
    },
    savePlayerXp() {
      this.SET_PLAYER_XP(this.activePlayer.xp)
    },
    setXp(xp, add) {
      const p = {
        ...this.activePlayer,
        xp: add ? this.activePlayer.xp + xp : this.activePlayer.xp - xp,
      }
      Vue.set(this.players, this.tab, p)
    },
    cureAll() {
      this.activePlayer.pokemons.forEach((p) => {
        this.changePokemonStatus(p, true)
      })
    },
  },
}
</script>

<style scoped>
::v-deep .v-data-table {
  height: 188px;
  overflow-y: auto;
}

.evolving {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  10% {
    opacity: 0.8;
  }

  30% {
    opacity: 0.7;
  }

  60% {
    opacity: 0.6;
  }

  80% {
    opacity: 0.4;
  }

  90% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.1;
  }
}
</style>
