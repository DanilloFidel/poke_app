<template>
  <div>
    <v-row dense justify="space-between" align="center" class="px-4">
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
          <span v-if="showCardText" class="mt-3 text-center overline">{{
            sortedCard.descr
          }}</span>
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
    showCardText: false,
    types: ["Normal", "Rara", "Ultra Rara"],
    sortedCard: {},
  }),
  computed: {
    cards() {
      const cards = [
        {
          isLucky: false,
          descr: `Você deu Berrys estragadas para seu Pokemon, perca de ${this.xp}xp`,
          type: "Rara",
        },

        {
          isLucky: true,
          descr:
            "Você dormiu bem e está com muita energia, role o dado novamente",
          type: "Normal",
        },
        {
          isLucky: true,
          descr: "Você encontrou um Pokemon aleatório (use o dado 3x)",
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
          descr: "Hora da batalha, sorteie um adversário",
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
          isLucky: true,
          descr: "Hora de lutar contra seu amigo ao lado",
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
        { isLucky: true, descr: "Avançe três casas", type: "Normal" },
        { isLucky: true, descr: "Avançe cinco casas", type: "Rara" },
        {
          isLucky: true,
          descr: "Vá p/ o centro de cura mais próximo",
          type: "Rara",
        },
        {
          isLucky: true,
          descr: "Acesse sua box a partir desta casa",
          type: "Rara",
        },
        { isLucky: true, descr: "Pegue um pokemon do seu amigo", type: "Rara" },
        {
          isLucky: true,
          descr: "Escolha um pokemon p/ subir 2 níveis",
          type: "Rara",
        },
        {
          isLucky: true,
          descr: "Escolha um pokemon p/ subir 3 níveis",
          type: "Rara",
        },
        {
          isLucky: true,
          descr: "Escolha um pokemon p/ subir 1 nível",
          type: "Nommal",
        },
        {
          isLucky: true,
          descr: "Escolha um pokemon p/ subir 4 níveis",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr: "Escolha um pokemon p/ subir 5 níveis",
          type: "Ultra Rara",
        },
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
          descr: "Escolha um Pokemon para evoluir (Box)",
          type: "Ultra Rara",
        },
        {
          isLucky: true,
          descr:
            "Meu Deus, aquilo é um... (Pokemon raro aleatório) use o dado 3x",
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
    getHabitat() {
      return this.habitats[parseInt(Math.random() * this.habitats.length)];
    },
    randomCards() {
      this.$nextTick(() => {
        this.showCardText = false;
      });
      let group = this.cards.filter((c) => c.type == this.cardType);
      this.sortedCard = group[Math.floor(Math.random() * group.length)];
      this.$nextTick(() => {
        this.showCardText = true;
      });
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
