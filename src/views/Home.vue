<template>
  <v-layout style="height:100%">
    <Viewer />
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Viewer from "@/application/components/pages/ViewerPage.vue";

@Component({
  components: {
    Viewer
  }
})
export default class Home extends Vue {}
</script>
