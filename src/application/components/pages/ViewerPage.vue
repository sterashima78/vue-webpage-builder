<template>
  <ViewerTemplate 
    :scripts="scripts"
    :styles="styles"
    :inlineScript="inlineScript"
    :tree="tree"
    :allComponents="allComponents"
    :nodes="nodes"
    :editTarget="editTarget"
    @loaded="reload"
    @updateInlineScript="updateInlineScript"
    @removeScript="removeScript"
    @addScript="addScript"
    @removeStyle="removeStyle"
    @addStyle="addStyle"
    @import="importJson"
    @export="exportJson"
    @download="download"
    @dragStart="dragStart"
    @dragEnd="dragEnd"
  />
</template>

<script lang="ts">
import { VNode, VNodeData } from "vue";
import { Component, Vue, Watch } from "vue-property-decorator";

import Optional from "typescript-optional";
import cloneDeep from "lodash.clonedeep";

import ViewerTemplate from "@/application/components/templates/ViewerTemplate.vue";
import { IVueNode, INodesState, IVueNodeTree } from "@/types";

import LocalVue from "@/util/LocalVue";
import toString from "@/util/toString";
import uuid from "uuid";
import Nodes from "@/store/modules/nodes";
import { Multipane, MultipaneResizer } from "vue-multipane";
import download from "downloadjs";
import { debounce } from "typescript-debounce-decorator";
import { DragItem } from "@/domain/model/DragItem";
import { ExporterService } from "@/domain/service/exporterService";
const service = new ExporterService();
@Component({
  components: {
    Multipane,
    MultipaneResizer,
    ViewerTemplate
  }
})
export default class Viewer extends Vue {
  public active: number = 0;
  private vm!: LocalVue;
  private scripts: { [id: string]: { name: string; url: string } } = {
    "vuetify-js": {
      name: "vuetify",
      url: "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"
    }
  };
  private styles: { [id: string]: { name: string; url: string } } = {
    "material-icon-css": {
      name: "material-icon",
      url:
        "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
    },
    "vuetify-css": {
      name: "vuetify",
      url: "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css"
    }
  };
  private inlineScript: string = "";
  // private tree: IVueNodeTree[] = [];

  private get allComponents(): string[] {
    return Nodes.components;
  }

  private get nodes(): { [id: string]: IVueNode } {
    return Nodes.allNodes;
  }

  private get dragItem(): DragItem {
    return Nodes.dragItem;
  }

  private get editTarget(): IVueNode {
    return Nodes.editTarget;
  }

  private get tree(): IVueNodeTree[] {
    return Nodes.tree;
  }

  private mounted() {
    this.nodesWatcher(this.nodes);
  }

  @Watch("nodes", { deep: true })
  private nodesWatcher(nodes: { [id: string]: IVueNode }): void {
    if (!this.vm) {
      setTimeout(() => this.nodesWatcher(nodes), 200);
      return;
    }
    this.vm.updateNodes(nodes);
  }

  @Watch("dragItem")
  private dragItemWatcher(item: DragItem): void {
    if (!this.vm) {
      setTimeout(() => this.dragItemWatcher(item), 200);
      return;
    }
    this.vm.updateDragItem(item);
  }

  private exportJson() {
    service.downloadJson(
      this.nodes,
      this.styles,
      this.scripts,
      this.inlineScript
    );
  }

  private importJson(obj: any) {
    Nodes.SET_NODES(obj.nodes);
    this.styles = obj.styles;
    this.scripts = obj.scripts;
    this.inlineScript = obj.inlineScript;
  }

  private dragStart(name: string) {
    Nodes.SET_NEW_COMPONENT_NAME(name);
  }

  private dragEnd(name: string) {
    Nodes.REMOVE_NEW_COMPONENT_NAME(name);
  }

  @debounce(500, { leading: false })
  private reload(window: Window) {
    // @ts-ignore
    const vue: VueConstructor<Vue> = window.Vue;
    const ele = window.document.getElementById("main-wrapper") as HTMLElement;
    this.vm = new LocalVue(ele, vue);
    Nodes.SET_COMPONENTS(this.vm.components);
    this.vm.updateNodes(this.nodes);
  }

  private removeStyle(key: string) {
    this.$delete(this.styles, key);
  }
  private removeScript(key: string) {
    this.$delete(this.scripts, key);
  }
  private addScript(resorce: { url: string; name: string }) {
    this.$set(this.scripts, `${resorce.name}-css`, resorce);
  }
  private addStyle(resorce: { url: string; name: string }) {
    this.$set(this.styles, `${resorce.name}-css`, resorce);
  }
  private updateInlineScript(script: string) {
    this.inlineScript = script;
  }

  private download() {
    service.downloadHtml(
      this.nodes,
      this.styles,
      this.scripts,
      this.inlineScript
    );
  }
}
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>
