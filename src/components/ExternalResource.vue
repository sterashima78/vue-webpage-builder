<template>
<div>
  <v-card flat>
    <v-card-text>
      <h3>Script</h3>
      <v-layout>
        <v-text-field v-model="scriptName" label="name"/>
        <v-text-field v-model="scriptUrl" label="url"/>
        <v-btn @click="addScript" :disabled="scriptName=='' || scriptUrl == ''">add</v-btn>
      </v-layout>
      <v-layout>
        <v-btn @click="inlineScriptDialog = true">inline script</v-btn>
      </v-layout>
      <v-list>
        <v-list-tile v-for="(obj, id) in scripts" :key="id">
          <v-list-tile-content>
            <v-list-tile-title v-text="obj.name"/>
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
        <v-list-tile v-for="(obj, id) in styles" :key="id">
          <v-list-tile-content>
            <v-list-tile-title v-text="obj.name"/>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon @click="removeStyle(id)" v-text="'delete'"/>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card-text>
  </v-card>
  <v-dialog v-model="inlineScriptDialog" scrollable>
    <v-card>
      <v-card-title>Inline JavaScript</v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 500px;">
        <Editor :code="code" @change="scriptUpdate"/>
      </v-card-text>
    </v-card>
  </v-dialog>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Editor from "./Ace.vue";

@Component({
  components: {
    Editor
  }
})
export default class ExternamResource extends Vue {
  @Prop({ type: Object, default: () => ({}) })
  private styles!: { [id: string]: string };

  @Prop({ type: Object, default: () => ({}) })
  private scripts!: { [id: string]: string };

  private styleUrl: string = "";
  private styleName: string = "";
  private scriptUrl: string = "";
  private scriptName: string = "";
  private code: string = "";
  private inlineScriptDialog = false;

  private removeScript(id: string) {
    this.$emit("removeStript", id);
  }
  private addScript() {
    this.$emit("addScript", { url: this.scriptUrl, name: this.scriptName });
  }

  private removeStyle(id: string) {
    this.$emit("removeStyle", id);
  }
  private addStyle() {
    this.$emit("addStyle", { url: this.styleUrl, name: this.styleName });
  }
  private scriptUpdate(code: string) {
    this.$emit("updateInlineScript", code);
  }
}
</script>

<style>
</style>
