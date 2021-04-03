<template>
  <v-simple-table fixed-header height="100vh">
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">Tipo</th>
          <th class="text-left">Fraqueza -1 dado</th>
          <th class="text-left">Vantagem +1 dado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(type, i) in types" :key="`t-${i}`" style="height: 120px">
          <td>
            <v-chip label small v-ripple :color="colors[type.name]">{{
              type.name
            }}</v-chip>
          </td>
          <td>
            <div class="d-flex flex-column">
              <v-chip
                label
                small
                v-ripple
                class="mx-2 my-1"
                v-for="(type, i) in type.damage_relations.double_damage_from"
                :key="`tdamage-${i}`"
                :color="colors[type.name]"
                >{{ type.name }}</v-chip
              >
            </div>
            <p></p>
          </td>
          <td>
            <div class="d-flex flex-column">
              <v-chip
                label
                small
                v-ripple
                class="mx-2 my-1"
                v-for="(type, i) in type.damage_relations.double_damage_to"
                :key="`tdstrong-${i}`"
                :color="colors[type.name]"
                >{{ type.name }}</v-chip
              >
            </div>
            <p></p>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import { mapActions } from "vuex";
import Http from "../plugins/http";

export default {
  name: "TypesCompareComponent",
  props: ["colors"],
  data: () => ({
    types: [],
  }),
  created() {},
  methods: {},
};
</script>

<style>
</style>