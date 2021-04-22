<template>
  <div class="hp-bar">
    <div
      class="hp-bar-filler"
      :style="{
        backgroundColor:
          (hp / originalHp) * 100 >= 60
            ? 'green'
            : (hp / originalHp) * 100 >= 20
            ? 'yellow'
            : 'red',
        width: `${(hp / originalHp) * 100}%`,
      }"
    ></div>
  </div>
</template>

<script>
export default {
  props: ["hp", "originalHp"],
};
</script>
<style lang="scss" scoped>
.hp-bar {
  width: 150px;
  height: 10px;
  bottom: 110px;
  position: absolute;
  background-color: grey;
  border-radius: 5px;
}

.hp-bar-filler {
  height: 10px;
  background-color: green;
  border-radius: 5px;
}
</style>