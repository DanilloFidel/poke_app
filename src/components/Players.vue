<template>
  <div>
    <v-tabs v-model="tab" centered>
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
                >Total XP: <b>{{ activePlayer.xp }}</b></span
              >
            </v-col>
            <v-col>
              <v-btn x-small @click="openAddModal">Adicionar Pokemon</v-btn>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-btn x-small icon @click="cureAll"
                ><v-icon>{{ potionIcon }}</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Nome</th>
                  <th class="text-left">Tipo</th>
                  <th class="text-left"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in activePlayer.pokemons"
                  :key="`${item} - ${i}`"
                  @dblclick="removePokemon(item)"
                  :style="{
                    backgroundColor: item.defeated ? '#ff00005c' : null,
                  }"
                >
                  <td @click="addOnTeam(item, i)">
                    <img
                      style="position: absolute; left: 10px"
                      v-if="item.onTeam"
                      width="10px"
                      height="10px"
                      src="../assets/pokeball.svg"
                    />
                    {{ item.name }}
                  </td>
                  <td>
                    <v-chip
                      small
                      x-small
                      @click="openTypesModal(item.types)"
                      pill
                      outlined
                      class="mt-2 mr-2 overline elevation-3"
                      v-for="(item_2, idx) in item.types"
                      :key="idx"
                      :color="colors[item_2.type.name]"
                      >{{ item_2.type.name }}</v-chip
                    >
                  </td>

                  <td>
                    <v-icon @click="changePokemonStatus(item)">{{
                      defeatedIcon
                    }}</v-icon>
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

    <v-dialog v-model="typesDialog">
      <v-card class="pa-3">
        <v-row dense>
          <span>Inimigo</span>
          <v-chip
            small
            x-small
            pill
            outlined
            class="ml-3 overline elevation-3"
            v-for="(item_2, idx) in enemyTypes"
            :key="idx"
            :color="colors[item_2.name]"
            >{{ item_2.name }}</v-chip
          >
        </v-row>
        <v-row dense class="mt-5">
          <span>Jogador</span>
          <v-chip
            small
            x-small
            pill
            outlined
            :style="{
              opacity: item_2.lose ? 0.3 : 1,
            }"
            class="ml-3 overline elevation-3"
            v-for="(item_2, idx) in playerTypes"
            :key="idx"
            :color="colors[item_2.type.name]"
            >{{ item_2.type.name }}</v-chip
          >
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
    typesDialog: false,
    closeIcon: mdiClose,
    enemyTypes: [],
    playerTypes: [],
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
    ...mapState(['activeFighter', 'types', 'savedPlayers', 'applyXp']),
  },
  watch: {
    applyXp(obj) {
      obj.val && this.setXp(obj.val, obj.win)
    },
  },
  props: ['colors'],
  created() {
    Http.get('pokemon?limit=1118').then(
      (resp) => (this.pokemons = resp.data.results)
    )
  },
  methods: {
    ...mapActions(['SET_PLAYERS']),
    removePokemon(item) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      )
      this.setXp(item.base_experience, false)
      Vue.delete(this.activePlayer.pokemons, idx)
    },
    addOnTeam(pk, idx) {
      const teamLength = this.activePlayer.pokemons.filter((p) => p.onTeam)
        .length
      const canAdd = teamLength < 6
      const poke = { ...pk, onTeam: canAdd ? !pk['onTeam'] : false }
      Vue.set(this.activePlayer.pokemons, idx, poke)
    },
    saveProgress() {
      this.SET_PLAYERS(this.players)
    },
    load() {
      if (this.savedPlayers.length) this.players = [...this.savedPlayers]
    },
    openTypesModal(types) {
      if (!this.activeFighter.name) return
      const enemyTypes = this.activeFighter.activePokemon.types.map(
        (t) => t.type.name
      )
      const typesInfo = this.types.filter((t) => enemyTypes.includes(t.name))
      if (typesInfo.length) {
        typesInfo.forEach((type) => {
          const win = type.damage_relations.double_damage_to.map((x) => x.name)
          const lose = type.damage_relations.double_damage_from.map(
            (x) => x.name
          )

          types.forEach((playerT) => {
            const name = playerT.type.name
            if (win.includes(name)) {
              playerT.lose = true
            }
            if (lose.includes(name)) {
              playerT.win = true
            }
          })
        })
        this.enemyTypes = typesInfo
        this.playerTypes = types
        console.log(this.playerTypes)
      }
      this.typesDialog = !this.typesDialog
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
    },
    changePokemonStatus(item, cure) {
      const idx = this.activePlayer.pokemons.findIndex(
        (p) => p.name === item.name
      )
      item.defeated = cure ? false : !item.defeated
      Vue.set(this.activePlayer.pokemons, idx, item)
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

<style>
</style>
