export default class Player {
    constructor({ name, pokemons = [], bag = [{ name: "pokeball", captureBonus: 255, img: "poke_ball", amount: 10 }, { name: "masterball", isMaster: true, img: "master_ball", amount: 1, price: 9999999 }], money = 2000 }) {
        this.name = name;
        this.pokemons = pokemons;
        this.money = money;
        this.bag = bag
    }
}