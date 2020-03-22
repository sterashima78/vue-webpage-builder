<template>
  <v-menu offset-y bottom left>
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on"></slot>
    </template>

    <v-list>
      <v-list-item @click="exportToHtml">
        <v-list-item-title>Download HTML</v-list-item-title>
      </v-list-item>
      <v-list-item @click="exportToJson">
        <v-list-item-title>Download Project as JSON</v-list-item-title>
      </v-list-item>
      <v-list-item @click="importProject">
        <v-list-item-title>Import Project from JSON</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import {
  importProject,
  exportToHtml,
  exportToJson
} from "@/compositions/exporter";
export default defineComponent({
  setup() {
    return {
      importProject,
      exportToHtml,
      exportToJson
    };
  }
});
</script>
