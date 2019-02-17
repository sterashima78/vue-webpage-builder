<template>
  <v-card flat>
    <v-card-text>
      <h3>Script</h3>
      <v-layout>
        <v-text-field v-model="scriptName" label="name"/>
        <v-text-field v-model="scriptUrl" label="url"/>
        <v-btn @click="addStyle" :disabled="scriptName=='' || scriptUrl == ''">add</v-btn>
      </v-layout>
      <v-list>
        <v-list-tile v-for="(name, id) in scripts" :key="id">
          <v-list-tile-content>
            <v-list-tile-title v-text="name"/>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon @click="removeScript(id)" v-text="'delete'"/>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <h3>Styles</h3>
      <v-layout>
        <v-text-field v-model="styleName" label="name"/>
        <v-text-field v-model="styleUrl" label="url"/>
        <v-btn @click="addStyle" :disabled="styleName=='' || styleUrl == ''">add</v-btn>
      </v-layout>
      <v-list>
        <v-list-tile v-for="(name, id) in styles" :key="id">
          <v-list-tile-content>
            <v-list-tile-title v-text="name"/>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon @click="removeStyle(id)" v-text="'delete'"/>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ExternamResource extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private styles!: { [id: string]: string };

  @Prop({ type: Object, default: () => ({}) })
  private scripts!: { [id: string]: string };

  private styleUrl: string = "";
  private styleName: string = "";
  private scriptUrl: string = "";
  private scriptName: string = "";

  private removeScript(id: string) {}
  private addScript(id: string) {}

  private removeStyle(id: string) {}
  private addStyle(id: string) {}
}
</script>

<style>
</style>
