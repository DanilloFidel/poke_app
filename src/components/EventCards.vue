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
