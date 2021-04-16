export default class Player {
    constructor({ name, pokemons = [], bag = [] }) {
        this.name = name;
        this.pokemons = pokemons;
        this.bag = bag
    }
}