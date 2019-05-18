<template>
  <v-layout>
    <VIframeSandbox 
      body="<div id='main-wrapper'></div>" 
      style="width:100%;height:100%" 
      :script="inlineScript"
      :scriptsSrc="scriptsSrc"
      :styles="stylesStr"
      :cssLinks="cssLinks"
      @loaded="loaded"
    />
    <div style="width: 500px;height:100%">
      <v-tabs v-model="active">
        <v-tab ripple>
          <v-icon>layers</v-icon>
        </v-tab>
        <v-tab ripple>
          <v-icon>dashboard</v-icon>
        </v-tab>
        <v-tab ripple>
          <v-icon>tune</v-icon>
        </v-tab>
        <v-tab ripple>
          <v-icon>code</v-icon>
        </v-tab>
        <v-tab ripple>
          <v-icon>get_app</v-icon>
        </v-tab>
        <v-tab-item>
          <ComponentTree @switch-tab="active = $event" :tree="tree"/>
        </v-tab-item>
        <v-tab-item>
          <ComponentsList 
            :components="allComponents"
            @dragStart="dragStart"
            @dragEnd="dragEnd"
          />
        </v-tab-item>
        <v-tab-item>
          <ComponentEditor @switch-tab="active = $event" :editTarget="editTarget"/>
        </v-tab-item>
        <v-tab-item>
          <ExternalResource 
            :scripts="scripts" 
            :styles="styles" 
            :inlineScript="inlineScript"
            @removeStyle="removeStyle" 
            @removeStript="removeScript"
            @addStyle="addStyle" 
            @addScript="addScript"
            @updateInlineScript="updateInlineScript"
          />
        </v-tab-item>
        <v-tab-item>
          <ImportExport 
            @import="emitStartImport" 
            @export="exportJson" 
            @download="download" 
          />
        </v-tab-item>
      </v-tabs>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { VNode, VNodeData } from "vue";
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

import Optional from "typescript-optional";
import cloneDeep from "lodash.clonedeep";

import { VIframeSandbox } from "vue-iframe-sandbox";
import ComponentsList from "@/application/components/organisms/ComponentsList.vue";
import ComponentEditor from "@/application/components/organisms/ComponentEditor.vue";
import ComponentTree from "@/application/components/organisms/ComponentTree.vue";
import ExternalResource from "@/application/components/organisms/ExternalResource.vue";
import ImportExport from "@/application/components/organisms/ImportExport.vue";

import { IVueNode, INodesState, IVueNodeTree } from "@/types";

import { Multipane, MultipaneResizer } from "vue-multipane";
import download from "downloadjs";
import { debounce } from "typescript-debounce-decorator";
import { DragItem } from "@/domain/model/DragItem";

@Component({
  components: {
    Multipane,
    MultipaneResizer,
    ComponentsList,
    ComponentEditor,
    ComponentTree,
    ExternalResource,
    ImportExport,
    VIframeSandbox
  }
})
export default class Viewer extends Vue {
  public active: number = 0;

  @Prop({ default: () => ({}) })
  private scripts!: { [id: string]: { name: string; url: string } };

  @Prop({ default: () => ({}) })
  private styles!: { [id: string]: { name: string; url: string } };

  @Prop({ default: "" })
  private inlineScript!: string;

  @Prop({ default: () => [] })
  private tree!: IVueNodeTree[];

  @Prop({ default: () => [] })
  private allComponents!: string[];

  @Prop({ default: () => ({}) })
  private nodes!: { [id: string]: IVueNode };

  @Prop({ default: () => ({}) })
  private editTarget!: IVueNode;

  private get scriptsSrc() {
    return [
      "https://cdn.jsdelivr.net/npm/vue/dist/vue.js",
      ...Object.keys(this.scripts).map(id => this.scripts[id].url)
    ];
  }
  private get cssLinks() {
    return Object.keys(this.styles).map(id => this.styles[id].url);
  }

  private get stylesStr() {
    return [
      ".drag-enter {border: 5px solid red !important; box-sizing: border-box !important}",
      ".vue-web-builder-hover {border: 5px solid blue !important; box-sizing: border-box !important}"
    ].join("\n");
  }

  private loaded(window: Window) {
    this.$emit("loaded", window);
  }

  private emitStartImport(files: FileList) {
    if (files.length < 1) {
      return;
    }
    this.$emit("import", files[0]);
  }

  private exportJson() {
    this.$emit("export");
  }

  private download() {
    this.$emit("download");
  }

  private updateInlineScript(code: string) {
    this.$emit("updateInlineScript", code);
  }

  private removeScript(id: string) {
    this.$emit("removeStript", id);
  }

  private addScript(resource: { url: string; name: string }) {
    this.$emit("addScript", resource);
  }

  private removeStyle(id: string) {
    this.$emit("removeStyle", id);
  }

  private addStyle(resource: { url: string; name: string }) {
    this.$emit("addStyle", resource);
  }

  private dragStart(name: string) {
    this.$emit("dragStart", name);
  }

  private dragEnd(name: string) {
    this.$emit("dragEnd", name);
  }
}
</script>
