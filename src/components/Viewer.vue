<template>
  <v-layout>
    <iframe style="width:100%;height:100%"/>
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
        <!-- <v-tab ripple>
          <v-icon>code</v-icon>
        </v-tab> -->
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
        <!-- <v-tab-item>
          <ExternalResource :scripts="scripts" :styles="styles"/>
        </v-tab-item> -->
        <v-tab-item>
          <v-btn @click="download">Download</v-btn>
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


import ComponentsList from "@/components/ComponentsList.vue";
import ComponentEditor from "@/components/ComponentEditor.vue";
import ComponentTree from "@/components/ComponentTree.vue";
import ExternalResource from "@/components/ExternalResource.vue";


import Iframe, { StyleRule } from "../util/Iframe";
import LocalVue from "../util/LocalVue";
import toString from "../util/toString";

import Nodes from "../store/modules/nodes";
import { treeSubject } from "../observer/"
import { Multipane, MultipaneResizer } from "vue-multipane";
import download from "downloadjs"
export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}


let tree:IVueNodeTree[]  = []
treeSubject.subscribe(t => (tree = t));

@Component({
  components: {
    Multipane,
    MultipaneResizer,
    ComponentsList,
    ComponentEditor,
    ComponentTree,
    ExternalResource
  }
})
export default class Viewer extends Vue {
  public iframe: Iframe = new Iframe(document.createElement("iframe"));
  public rootElement: HTMLElement = document.createElement("div");
  public vm: any = {};
  public active: number = 0;
  private scripts: { [id: string]: string } = {};
  private styles: { [id: string]: string } = {};

  public get allComponents(): string[] {
    return Nodes.components;
  }

  public async mounted() {
    this.initialize()
  }

  private async initialize() {
    const ele: HTMLIFrameElement|null = this.$el.querySelector("iframe");
    if (ele == null) {
      return;
    }
    if (ele.contentWindow == null) {
      return;
    }
    ele.onload = async ()=>{
      this.iframe = new Iframe(ele);
      this.initVuetifyCss();
      this.initGrobalStyle();
      await this.initJs();
      await this.initVuetifyJs();
      this.iframe.document.body.appendChild(this.rootElement);
      this.vm = new LocalVue(
        this.rootElement,
        // @ts-ignore
        this.iframe.window.get().Vue
      );
      console.log("a")
    }
    console.log("y")
    ele.contentWindow.location.reload();
    
  } 

  private async initJs() {
    await this.iframe.addScript("https://cdn.jsdelivr.net/npm/vue/dist/vue.js");
  }

  private initGrobalStyle() {
    const styles = new Map<string, string>();
    styles.set("border", "5px solid red !important");
    styles.set("box-sizing", "border-box !important");

    const styles2 = new Map<string, string>();
    styles2.set("border", "5px solid blue !important");
    styles2.set("box-sizing", "border-box !important");

    this.iframe.addStyle([
      { selector: ".drag-enter", styles },
      { selector: ".vue-web-builder-hover", styles: styles2 }
    ]);
  }

  private async initVuetifyJs() {
    const id = await this.iframe.addScript(
      "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"
    );
    this.scripts[id] = "vuetify";
  }

  private initVuetifyCss() {
    let id = "";
    id = this.iframe.addLink(
      "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
    );
    this.styles[id] = "material-icon";
    id = this.iframe.addLink(
      "https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css"
    );
    this.styles[id] = "vuetify";
  }

  private download(){
    const id = Nodes.topNodes.filter(i => i.parentId == '').map(i => i.id)[0]
    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Vue Web desginer</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css">
</head>
<body>
  <div id="app-main" style="height:100%;width:100%">
  ${toString(id, Nodes.allNodes, true)}
  </div>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js"><\/script>
  <script>
  new Vue({
    el: "#app-main"
  })
  <\/script>
</body>
</html>
`;
    download(template, "index.html", "text/html")
  }
}
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>
