<template>
<div>
  <h3>{{title}}</h3>
  <v-layout>
    <v-text-field v-model="name" label="name"/>
    <v-text-field v-model="url" label="url"/>
    <v-btn @click="add" :disabled="name=='' || url == ''">add</v-btn>
  </v-layout>
  <v-list>
    <v-list-tile v-for="(obj, id) in resources" :key="id">
      <v-list-tile-content>
        <v-list-tile-title v-text="obj.name"/>
      </v-list-tile-content>
      <v-list-tile-action>
        <v-icon @click="remove(id)" v-text="'delete'"/>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class Resource extends Vue {
  @Prop({ type: String, default: "" })
  private title!: string;

  @Prop({ type: Object, default: () => ({}) })
  private resources!: { [id: string]: string };

  private url: string = "";
  private name: string = "";

  private remove(id: string) {
    this.$emit("remove", id);
  }
  private add() {
    this.$emit("add", { url: this.url, name: this.name });
  }
}
</script>
