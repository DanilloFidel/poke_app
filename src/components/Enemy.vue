<template>
  <div>
    <v-row dense align="center" class="pa-2">
      <v-col cols="6" align-self="end">
        <v-btn small class="my-2" color="#fca838" @click="sortEnemy"
          >Sortear Inimigo</v-btn
        >
        <v-btn
          small
          class="my-2"
          color="#6cb7f2"
          @click="showLeaders = !showLeaders"
          >Líder de Ginásio</v-btn
        >
      </v-col>
      <v-col cols="6" v-if="showLeaders">
        <v-select
          :items="gymLeaders"
          item-text="name"
          return-object
          @change="sortedEnemy = $event"
        >
        </v-select>
      </v-col>
    </v-row>
    <v-row dense justify="center">
      <v-col cols="10">
        <div
          class="card d-flex justify-center elevation-4 align-center px-2"
          v-ripple
        >
          <img :src="sortedEnemy.img" width="inherit" height="250px" alt="" />
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "EnemyComponent",
  data: () => ({
    sortedEnemy: {},
    enemies: [],
    showLeaders: false,
    gymLeaders: [
      {
        name: "Brock",
        pokemons: [],
        type: "Pedra",
        bagde: "da Rocha",
        img: require("../assets/enemies/brock.png"),
      },
      {
        name: "Misty",
        pokemons: [],
        type: "Água",
        bagde: "da Cascata",
        img: require("../assets/enemies/misty.png"),
      },
      {
        name: "Chuck",
        pokemons: [],
        type: "Lutador",
        bagde: "da Tempestade",
        img: require("../assets/enemies/chuck.png"),
      },
      {
        name: "Clair",
        pokemons: [],
        type: "Dragão",
        bagde: "da Ascensão",
        img: require("../assets/enemies/clair.png"),
      },
      {
        name: "Erika",
        pokemons: [],
        type: "Planta",
        bagde: "do Arco-Íris",
        img: require("../assets/enemies/erika.png"),
      },
      {
        name: "Morty",
        pokemons: [],
        type: "Fantasma",
        bagde: "da Névoa",
        img: require("../assets/enemies/morty.jpg"),
      },
      {
        name: "Falkner",
        pokemons: [],
        type: "Voador",
        bagde: "do Zéfiro",
        img: require("../assets/enemies/falkner.jpg"),
      },
      {
        name: "Flannery",
        pokemons: [],
        type: "Fogo",
        bagde: "do Calor",
        img: require("../assets/enemies/flanery.png"),
      },
      {
        name: "Giovanni",
        pokemons: [],
        type: "Terra",
        bagde: "da Terra",
        img: require("../assets/enemies/giovanni.png"),
      },
      {
        name: "Pryce",
        pokemons: [],
        type: "Gelo",
        bagde: "da Geleira",
        img: require("../assets/enemies/pryce.png"),
      },
      {
        name: "Sargento Surge",
        pokemons: [],
        type: "Elétrico",
        bagde: "do Trovão",
        img: require("../assets/enemies/st_surge.png"),
      },
      {
        name: "Tate e Liza",
        pokemons: [],
        type: "Psíquico",
        bagde: "da Mente",
        img: require("../assets/enemies/tate_and_liza.png"),
      },
    ],
  }),
  computed: {},
  methods: {
    sortEnemy() {
      this.sortedEnemy = this.enemies[
        Math.floor(Math.random() * this.enemies.length)
      ];
    },
  },
};
</script>

<style>
.card {
  height: 300px;
  /* width: 300px; */
  border: 3px solid rgb(7, 7, 129);
}
</style>