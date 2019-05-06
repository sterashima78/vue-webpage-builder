<template>
<v-card flat class="menu-tab-item">
  <v-card-text>
    <slot />
  </v-card-text>
</v-card>
</template>

<script>
export default {};
</script>

<style scoped>
.menu-tab-item {
  overflow-y: scroll;
  height: calc(100vh - 50px);
}
</style>
