<template>
  <div>
    <v-row dense justify="space-around" align="center">
      <v-col cols="3" class="ml-3">
        <v-radio-group v-model="cardType">
          <v-radio
            color="red"
            v-for="n in types"
            :key="n"
            :label="n"
            :value="n"
          ></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="3">
        <v-btn color="red" @click="randomCards">Sortear</v-btn>
      </v-col>
    </v-row>
    <v-row dense justify="center">
      <v-col cols="10">
        <div class="card d-flex justify-center elevation-4">
          <span class="mt-3 text-center overline">{{ sortedCard.descr }}</span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "EventCardsComponent",
  data: () => ({
    cardType: "Normal",
    types: ["Normal", "Raras", "Ultra Raras"],
    sortedCard: {},
    xp: 10,
    cardTypeXpRange: {
      Normal: [10, 200],
      Raras: [201, 400],
      "Ultra Raras": [401, 800],
    },
  }),
  computed: {
    cards() {
      return [
        { descr: `Você ganhou ${this.xp}xp`, type: "Normal" },
        { descr: `Você ganhou ${this.xp}xp`, type: "Raras" },
        { descr: `Você ganhou ${this.xp}xp`, type: "Ultra Raras" },
        { descr: `Você perdeu ${this.xp}xp`, type: "Normal" },
        { descr: `Você perdeu ${this.xp}xp`, type: "Raras" },
        { descr: `Você perdeu ${this.xp}xp`, type: "Ultra Raras" },
        { descr: "Avançe duas casas", type: "Normal" },
        { descr: "Avançe uma casa", type: "Normal" },
        { descr: "Cure um Pokemon", type: "Normal" },
        { descr: "Avançe três casas", type: "Normal" },
        { descr: "Avançe cinco casas", type: "Raras" },
        { descr: "Avançe seis casas", type: "Raras" },
        { descr: "Seu Pokemon fugiu!", type: "Raras" },
        { descr: "Ganhou item de Chance Extra", type: "Raras" },
        { descr: "Avançe oito casas", type: "Ultra Raras" },
        { descr: "Vá para floresta Oculta", type: "Raras" },
        { descr: "Volte quatro casas", type: "Raras" },
        {
          descr: "Escolha um Pokemon para evoluir (Time)",
          type: "Ultra Raras",
        },
        {
          descr: "Escolha um Pokemon para evoluir (Coleção)",
          type: "Ultra Raras",
        },
        { descr: "", type: "Ultra Raras" },
        { descr: "bla bla bla", type: "Ultra Raras" },
      ];
    },
  },
  methods: {
    getRandomArbitrary(min, max) {
      return parseInt(Math.random() * (max - min) + min);
    },
    randomCards() {
      const group = this.cards.filter((c) => c.type == this.cardType);
      const xpRanges = this.cardTypeXpRange[this.cardType];
      this.xp = this.getRandomArbitrary(xpRanges[0], xpRanges[1]);
      this.sortedCard = group[Math.floor(Math.random() * group.length)];
    },
  },
};
</script>

<style>
.card {
  height: 400px;
  background: #f1dddd;
  /* width: 300px; */
  border: 3px solid darkred;
}
</style>