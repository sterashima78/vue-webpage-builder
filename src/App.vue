<template>
  <div id="app">
    <v-app>
      <router-view />
    </v-app>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
export default defineComponent({});
</script>
<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
