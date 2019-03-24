<template>
  <v-card flat style="overflow-y: scroll; height: calc(100vh - 50px);">
    <v-card-text>
      <v-select :items="['html', 'component']" v-model="type"/>
      <v-text-field v-model="filter" label="filter"/>
      <v-container grid-list-xl>
        <v-layout wrap>
          <v-flex xs6 v-for="name in filteredComponents" :key="name">
            <v-sheet
              draggable="true"
              height="75"
              :elevation="20"
              style="word-break: break-all;cursor: move;"
              @dragstart.native.stop="cmpDragStart(name)"
              @dragend.native.stop="cmpDragEnd(name)"
              @dragover="$event.preventDefault()"
            >{{name}}</v-sheet>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import Nodes from "../store/modules/nodes";
import HTMLTags from "./tags";
@Component
export default class ComponentsList extends Vue {
  private filter = "";
  private type = "html";
  public get filteredComponents(): string[] {
    switch (this.type) {
      case "html":
        return HTMLTags.filter(c => new RegExp(this.filter, "i").test(c)).sort();
      case "component":
        return Nodes.components.filter(c =>
          new RegExp(this.filter, "i").test(c)
        );
      default:
        return [];
    }
  }

  public cmpDragStart(name: string) {
    Nodes.SET_NEW_COMPONENT_NAME(name);
  }

  public cmpDragEnd(name: string) {
    Nodes.REMOVE_NEW_COMPONENT_NAME(name);
  }
}
</script>
