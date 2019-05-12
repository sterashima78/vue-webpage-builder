<template>
  <ViewerTemplate 
    :scripts="scripts"
    :styles="styles"
    :inlineScript="inlineScript"
    :tree="tree"
    :allComponents="allComponents"
    :nodes="nodes"
    :editTarget="editTarget"
    @loaded="loaded"
    @updateInlineScript="updateInlineScript"
    @removeStript="removeStript"
    @addScript="addScript"
    @removeStyle="removeStyle"
    @addStyle="addStyle"
    @import="importJsonFile"
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
  private scripts: { [id: string]: { name: string; url: string } } = {};
  private styles: { [id: string]: { name: string; url: string } } = {};
  private inlineScript: string = "";
  private tree: IVueNodeTree[] = [];

  private get allComponents(): string[] {
    return Nodes.components;
  }

  private get nodes(): { [id: string]: IVueNode } {
    return Nodes.nodes;
  }

  private get dragItem(): DragItem {
    return Nodes.dragItem;
  }

  private get editTarget(): IVueNode {
    return Nodes.editTarget;
  }

  @Watch("nodes", { deep: true })
  private nodesWatcher(nodes: { [id: string]: IVueNode }): void {
    if (!this.vm) {
      setTimeout(() => this.nodesWatcher(nodes), 200);
      return;
    }
    this.vm.updateNodes(nodes);
    const tree = Object.keys(nodes)
      .filter((id: string) => nodes[id].parentId === "")
      .map((id: string) => nodes[id])
      .map(node => buildTree(node, nodes))
      .filter(n => n.id !== "");
    this.tree = tree;
  }

  @Watch("dragItem")
  private dragItemWatcher(item: DragItem): void {
    if (!this.vm) {
      setTimeout(() => this.dragItemWatcher(item), 200);
      return;
    }
    this.vm.updateDragItem(item);
  }

  private mounted() {
    this.initializeNodes();
    this.initVuetifyCss();
    this.initVuetifyJs();
  }

  private exportJson() {
    download(
      JSON.stringify({
        nodes: Nodes.allNodes,
        styles: this.styles,
        scripts: this.scripts
      }),
      "project.json",
      "application/json"
    );
  }

  private importJsonFile(file: FileList) {
    const reader = new FileReader();
    reader.onload = event => {
      // @ts-ignore
      const text = event.target.result;
      try {
        this.importJson(text);
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(file[0]);
  }

  private importJson(json: string) {
    const { nodes, scripts, styles } = JSON.parse(json);
    Nodes.SET_NODES(nodes);
    this.styles = styles;
    this.scripts = scripts;
  }

  private initializeNodes() {
    const Id0 = uuid.v4();
    Nodes.SET_NODES({
      [Id0]: {
        id: Id0,
        parentId: "",
        childrenId: [],
        attr: {
          style: {
            height: "100%",
            width: "100%"
          },
          class: [],
          attrs: {}
        },
        tag: "div"
      }
    });
  }

  private dragStart(name: string) {
    Nodes.SET_NEW_COMPONENT_NAME(name);
  }

  private dragEnd(name: string) {
    Nodes.REMOVE_NEW_COMPONENT_NAME(name);
  }

  @debounce(500, { leading: false })
  private reload(window: Window) {
    this.vm = new LocalVue(
      window.document.getElementById("main-wrapper") as HTMLElement,
      // @ts-ignore
      window.Vue
    );
    Nodes.SET_COMPONENTS(this.vm.components);
    this.vm.updateNodes(Nodes.nodes);
  }

  private initVuetifyJs() {
    this.$set(this.scripts, "vuetify-js", {
      name: "vuetify",
      url: "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"
    });
  }

  private initVuetifyCss() {
    this.$set(this.styles, "material-icon-css", {
      name: "material-icon",
      url:
        "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
    });
    this.$set(this.styles, "vuetify-css", {
      name: "vuetify",
      url: "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css"
    });
  }

  private download() {
    const id = Nodes.topNodes.filter(i => i.parentId === "").map(i => i.id)[0];
    const style = Object.keys(this.styles)
      .map(i => `<link rel="stylesheet" href="${this.styles[i].url}">`)
      .join("");
    const script = Object.keys(this.scripts)
      .map(i => `<script src="${this.scripts[i].url}"><\/script>`)
      .join("");
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Vue Web desginer</title>
  ${style}
</head>
<body>
  <div id="app-main" style="height:100%;width:100%">
  ${toString(id, Nodes.allNodes, true)}
  </div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"><\/script>
  ${script}
  <script>
  ${this.inlineScript}
  new Vue({
    el: "#app-main"
  })
  <\/script>
</body>
</html>
`;
    download(template, "index.html", "text/html");
  }
}

const buildTree = (
  node: IVueNode,
  allNodes: { [id: string]: IVueNode }
): IVueNodeTree => {
  return {
    id: node.id,
    name: node.tag,
    children: node.childrenId.reduce(
      (arr: IVueNodeTree[], id: string): IVueNodeTree[] => {
        if (!allNodes[id]) {
          return arr;
        }
        arr.push(buildTree(allNodes[id], allNodes));
        return arr;
      },
      []
    )
  };
};
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>
