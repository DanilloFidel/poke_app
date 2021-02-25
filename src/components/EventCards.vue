<template>
  <div>
    <v-row dense justify="space-between" align="center">
      <v-col cols="6" class="ml-3">
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
      <v-col cols="4">
        <v-btn color="red" @click="randomCards">Sortear</v-btn>
      </v-col>
    </v-row>
    <v-row dense justify="center">
      <v-col cols="10">
        <div
          class="card d-flex justify-center elevation-4 align-center px-2"
          v-ripple
          :class="{
            'lucky-card': sortedCard.isLucky,
            'no-selected': !sortedCard.descr,
          }"
        >
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
    types: ["Normal", "Rara", "Ultra Rara"],
    sortedCard: {},
    xp: 10,
    cardTypeXpRange: {
      Normal: [10, 200],
      Rara: [201, 400],
      "Ultra Rara": [401, 800],
    },
  }),
  computed: {
    cards() {
      const cards = [
        { isLucky: true, descr: `Você ganhou ${this.xp}xp`, type: "Normal" },
        { isLucky: true, descr: `Você ganhou ${this.xp}xp`, type: "Rara" },
        {
          isLucky: true,
          descr: `Você ganhou ${this.xp}xp`,
          type: "Ultra Rara",
        },
        { isLucky: false, descr: `Você perdeu ${this.xp}xp`, type: "Normal" },
        {
          isLucky: false,
          descr: `Você deu Berrys estragadas para seu Pokemon, perca de ${this.xp}xp`,
          type: "Rara",
        },
        {
          isLucky: false,
          descr: `Você perdeu ${this.xp}xp`,
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr:
            "Você dormiu bem e está com muita energia, role o dado novamente",
          type: "Normal",
        },
        {
          isLucky: true,
          descr: "Você encontrou um Pokemon aleatório",
          type: "Normal",
        },
        {
          isLucky: true,
          descr:
            "Role um d6, o número que obter é a quantidade de vezes que você deve clicar para encontrar um Pokemon aleatório",
          type: "Normal",
        },
        {
          isLucky: true,
          descr: "Ao encontrar um amigo ele te deu uma poção de reviver",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr: "Você ganhou um item de anulação de tipo",
          type: "Rara",
        },
        {
          isLucky: false,
          descr: "Oh não, um Snorlax no caminho! perca uma rodada",
          type: "Normal",
        },
        {
          isLucky: true,
          descr: "Você ganhou Item de Fuga, para escapar de uma batalha",
          type: "Rara",
        },
        {
          isLucky: false,
          descr:
            "Entregue um Pokemon do seu time para os cuidados de um adversário",
          type: "Rara",
        },
        { isLucky: true, descr: "Avançe duas casas", type: "Normal" },

        { isLucky: true, descr: "Avançe uma casa", type: "Normal" },
        { isLucky: true, descr: "Cure um Pokemon", type: "Normal" },
        {
          isLucky: true,
          descr:
            "Role um d6, o valor que ganhar, multiplique por x10, é o total de XP que ganhou!",
          type: "Normal",
        },
        {
          isLucky: true,
          descr:
            "Role o d6, o valor que ganhar, multiplique por x30, é o total de XP que ganhou!",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr:
            "Role o d6, o valor que ganhar, multiplique por x20, é o total de XP que ganhou!",
          type: "Rara",
        },
        { isLucky: true, descr: "Avançe três casas", type: "Normal" },
        { isLucky: true, descr: "Avançe cinco casas", type: "Rara" },
        { isLucky: true, descr: "Avançe seis casas", type: "Rara" },
        { isLucky: false, descr: "Seu Pokemon fugiu!", type: "Rara" },
        { isLucky: true, descr: "Ganhou item de Chance Extra", type: "Rara" },
        { isLucky: true, descr: "Avançe oito casas", type: "Ultra Rara" },
        { isLucky: true, descr: "Vá para floresta Oculta", type: "Rara" },
        { isLucky: false, descr: "Volte quatro casas", type: "Rara" },
        {
          isLucky: true,
          descr: "Escolha um Pokemon para evoluir (Time)",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr: "Escolha um Pokemon para evoluir (Coleção)",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr: "Meu Deus, aquilo é um... (Pokemon raro aleatório)",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr: `Meu Deus, aquilo é um... (Pokemon ${this.getHabitat()} aleatório)`,
          type: "Rara",
        },
        {
          isLucky: true,
          descr:
            "Escolha um Pokemon de um adversário para juntar-se ao seu time",
          type: "Ultra Rara",
        },
      ];
      return new Array(10).fill(cards).flat();
    },
  },
  props: ["habitats"],
  methods: {
    getRandomArbitrary(min, max) {
      return parseInt(Math.random() * (max - min) + min);
    },
    getHabitat() {
      return this.habitats[parseInt(Math.random() * this.habitats.length)];
    },
    randomCards() {
      let group = this.cards.filter((c) => c.type == this.cardType);
      const xpRanges = this.cardTypeXpRange[this.cardType];
      this.xp = this.getRandomArbitrary(xpRanges[0], xpRanges[1]);
      this.sortedCard = group[Math.floor(Math.random() * group.length)];
    },
  },
};
</script>

<style scoped>
.card {
  height: 250px;
  background: #fabcbc;
  /* width: 300px; */
  border: 3px solid darkred;
}

.lucky-card {
  background-color: rgb(138, 245, 138) !important;
  border: 3px solid rgb(4, 109, 0) !important;
}

.no-selected {
  background-color: rgb(138, 138, 138) !important;
  border: 3px solid rgb(15, 15, 15) !important;
}
</style>