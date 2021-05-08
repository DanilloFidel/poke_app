<template>
  <v-container>
    <span>Carrinho: R${{ cartValue }}</span>
    <v-btn small class="ml-5" @click="buy">Comprar</v-btn>
    <v-simple-table fixed-header style="max-height: 84vh; overflow-y: auto">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Nome</th>
            <th class="text-left">Preço</th>
            <th class="text-left">Qtd</th>
            <th class="text-left">Adicionar</th>
            <th class="text-left">Remover</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in shopItems" :key="`${item} - ${i}`">
            <td>
              {{ item.name }}
            </td>
            <td>
              <span>{{ item.price }}</span>
            </td>
            <td>
              <span>{{ getAmount(item) }}</span>
            </td>
            <td>
              <v-btn x-small color="green" @click="setItem(item, true)"
                >+</v-btn
              >
            </td>
            <td>
              <v-btn x-small color="red" @click="setItem(item, false)">-</v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import Vue from "vue";
import { mapActions, mapState } from "vuex";
export default {
  data: () => ({
    cartItems: [],
    items: [
      { name: "Bicicleta comum", price: 8000, amount: 0 },
      { name: "Escape Hope", price: 350, amount: 0 },
      { name: "Curar Todos", price: 800, amount: 0 },
    ],
  }),
  created() {
    // console.log(this.shopItems);
  },
  props: ["tab"],
  computed: {
    ...mapState(["pokeballTypes", "activePlayer"]),
    shopItems() {
      return [...this.pokeballTypes.filter((p) => !p.isMaster), ...this.items];
    },
    cartValue() {
      return this.cartItems.reduce(
        (acc, el) => (acc += el.price * el.amount),
        0
      );
    },
  },
  methods: {
    ...mapActions(["UPDATE_PLAYER_ATTR"]),
    buy() {
      if (this.activePlayer.money < this.cartValue) {
        alert("Saldo insuficiente");
        return;
      } else {
        this.activePlayer.money -= this.cartValue;
        this.cartItems.forEach((item) => {
          const idx = this.activePlayer.bag.findIndex(
            (x) => x.name === item.name
          );
          if (idx < 0) {
            this.activePlayer.bag.push(item);
          } else {
            let itemOn = this.activePlayer.bag[idx];
            itemOn.amount += item.amount;
          }
        });
        this.UPDATE_PLAYER_ATTR({ player: this.activePlayer, idx: this.tab });
        this.cartItems = [];
      }
    },
    getAmount(item) {
      const idx = this.cartItems.findIndex((x) => x.name === item.name);

      return this.cartItems[idx] ? this.cartItems[idx].amount : 0;
    },
    setItem(item, add) {
      const idx = this.cartItems.findIndex((x) => x.name === item.name);
      if (idx < 0) {
        item.amount = 1;
        if (add) this.cartItems.push(item);
      } else {
        let itemOn = this.cartItems[idx];
        if (add) itemOn.amount += 1;
        else if (itemOn.amount > 0) itemOn.amount -= 1;
        else {
          Vue.delete(this.cartItems, idx);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .v-data-table__wrapper {
  max-height: 75vh;
}
</style>