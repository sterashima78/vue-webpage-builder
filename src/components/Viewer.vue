<template>
  <v-layout>
    <VIframeSandbox 
      body="<div id='main-wrapper'></div>" 
      style="width:100%;height:100%" 
      :script="inlineScript"
      :scriptsSrc="scriptsSrc"
      :styles="stylesStr"
      :cssLinks="cssLinks"
      @loaded="reload"
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
          <ComponentTree @switch-tab="active = $event"/>
        </v-tab-item>
        <v-tab-item>
          <ComponentsList/>
        </v-tab-item>
        <v-tab-item>
          <ComponentEditor @switch-tab="active = $event"/>
        </v-tab-item>
        <v-tab-item>
          <ExternalResource 
            :scripts="scripts" 
            :styles="styles" 
            @removeStyle="$delete(styles, $event)" 
            @removeStript="$delete(scripts, $event)"
            @addStyle="$set(styles, `${$event.name}-css`, $event)" 
            @addScript="$set(scripts, `${$event.name}-js`, $event)"
            @updateInlineScript="inlineScript = $event"
          />
        </v-tab-item>
        <v-tab-item>
          <p>
            <v-btn @click="download">Download</v-btn>
          </p>
          <p>
            <v-btn @click="exportJson">Export</v-btn>
          </p>
          <p>
            <label>
              <span>Import: </span>
              <input type="file" @change="importJsonFile($event.target.files)" accept='application/json'>
            </label>
          </p>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-layout>
</template>

<script lang="ts">
import { VNode, VNodeData } from "vue";
import { Component, Vue, Watch } from "vue-property-decorator";

import Optional from "typescript-optional";
import cloneDeep from "lodash.clonedeep";

import { VIframeSandbox } from "vue-iframe-sandbox";
import ComponentsList from "@/components/ComponentsList.vue";
import ComponentEditor from "@/components/ComponentEditor.vue";
import ComponentTree from "@/components/ComponentTree.vue";
import ExternalResource from "@/components/ExternalResource.vue";
import { IVueNode, INodesState } from "@/types";

import LocalVue from "../util/LocalVue";
import toString from "../util/toString";
import uuid from "uuid";
import Nodes from "../store/modules/nodes";
import { treeSubject } from "../observer/";
import { Multipane, MultipaneResizer } from "vue-multipane";
import download from "downloadjs";
import { debounce } from "typescript-debounce-decorator";
import { DragItem } from '../domain/model/DragItem';
export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}

let tree: IVueNodeTree[] = [];
treeSubject.subscribe(t => (tree = t));

@Component({
  components: {
    Multipane,
    MultipaneResizer,
    ComponentsList,
    ComponentEditor,
    ComponentTree,
    ExternalResource,
    VIframeSandbox
  }
})
export default class Viewer extends Vue {
  private vm!: LocalVue;
  public active: number = 0;
  private scripts: { [id: string]: { name: string; url: string } } = {};
  private styles: { [id: string]: { name: string; url: string } } = {};
  private inlineScript: string = "";

  private get allComponents(): string[] {
    return Nodes.components;
  }

  private get nodes():{ [id: string]: IVueNode } {
    return Nodes.nodes;
  }

  private get dragItem(): DragItem {
    return Nodes.dragItem;
  }

  @Watch("nodes")
  private nodesWatcher(nodes: { [id: string]: IVueNode }): void {
    if(!this.vm) {
      setTimeout(()=> {
        this.nodesWatcher(nodes)
      }, 200)
      return 
    }
    this.vm.updateNodes(nodes)
  }

  @Watch("dragItem")
  private dragItemWatcher(item: DragItem): void {
    if(!this.vm) {
      setTimeout(()=> {
        this.dragItemWatcher(item)
      }, 200)
      return 
    }
    this.vm.updateDragItem(item)
  }

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

  @debounce(500, { leading: false })
  private reload(window: Window) {
    this.vm = new LocalVue(
      window.document.getElementById("main-wrapper") as HTMLElement,
      // @ts-ignore
      window.Vue
    );
    Nodes.SET_COMPONENTS(this.vm.components)
    Nodes.SEND_NDOES();
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
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>
