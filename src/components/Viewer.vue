<template>
<v-layout>
  <iframe style="width:100%;height:500px" />
  <div style="width: 300px">
    <v-switch
      :label="isSort ? 'ソートモード' : 'Addモード'"
      v-model="isSort"
    ></v-switch>
    <v-btn @click="addToolbar">Add toolbar</v-btn>
    <v-btn @click="addBtn">Add btn</v-btn>
    <v-btn @click="addIcon">Add Icon</v-btn>
    
    <v-btn @click="addElement('div', {class: ['layout']})">Add Layout</v-btn>
    <div @dragstart="newBtn" draggable="true">new btn</div>
    <div @dragstart="newToolbar" draggable="true">new toolbar</div>
  </div>
</v-layout>
</template>

<script lang="ts">
import VueJS from "vue";
import {CreateElement, VNode, VNodeData } from "vue";
import Vuetify from 'vuetify';
VueJS.use(Vuetify);

import { Component, Vue, Watch } from 'vue-property-decorator';
import Optional from "typescript-optional";

import cloneDeep from "lodash.clonedeep"
import merge from "lodash.merge"

import LocalVue from "../util/LocalVue"

interface VueNode {
  id: number
  tag: string;
  attr: VNodeData;
  // children: Array<VueNode>;
  childrenId: string[];
  parentId: string;
}

interface styleRule {
  selector: string;
  styles: Map<string, string>
}

@Component
export default class Viewer extends Vue {
  isSort: boolean = true
  counter: number = 100;
  rootElement: HTMLElement = document.createElement("div");
  vm: any = {};
  nodes: Map<string, VueNode> = new Map<string, VueNode>([
    [`__VUE_WEB_BUILDER_0__`, {id: 0, tag: "v-app", attr: {}, childrenId: [`__VUE_WEB_BUILDER_1__`], parentId: `__VUE_WEB_BUILDER_-1__`}],
    [`__VUE_WEB_BUILDER_1__`, {id: 1, tag: "div", attr: {class: ["layout"]}, childrenId: [], parentId: `__VUE_WEB_BUILDER_0__`}],
  ]);

  newElement(tag: string, data: VNodeData, childrenId: string[] = [], parentId: string = "__VUE_WEB_BUILDER_1__"): Optional<VueNode>{
    const ele: VueNode = {
      id: ++this.counter,
      tag: tag, 
      attr: {}, 
      childrenId,
      parentId
    }
    return Optional.ofNullable(this.nodes.get(parentId)).map((parentNode)=>{
      parentNode.childrenId.push(`__VUE_WEB_BUILDER_${ele.id}__`)
      const attr = merge({
        domProps: {
          __VUE_WEB_BUILDER__: {
            id: ele.id
          }
        }, 
        attrs: {
          draggable: true
        },
        on: {
          dragstart: ($event: DragEvent)=> this.dragStart(ele, $event),
          dragend: ($event: DragEvent)=> this.dragEnd(ele, $event),
          dragenter: ($event: DragEvent)=> this.dragEnter(ele, $event),
          dragleave: ($event: DragEvent)=> this.dragLeave(ele, $event),
          drop: ($event: DragEvent)=> this.drop(ele, $event),
          dragover: ($event: DragEvent)=> $event.preventDefault(),
        },
        nativeOn: {
          dragstart: ($event: DragEvent)=> this.dragStart(ele, $event),
          dragend: ($event: DragEvent)=> this.dragEnd(ele, $event),
          dragenter: ($event: DragEvent)=> this.dragEnter(ele, $event),
          dragleave: ($event: DragEvent)=> this.dragLeave(ele, $event),
          drop: ($event: DragEvent)=> this.drop(ele, $event),
          dragover: ($event: DragEvent)=> $event.preventDefault(),
        },
        class: []
      },data)
      ele.attr = attr
      return ele
    })
  }
  addElement(tag: string, data: VNodeData, children: string[] = []){
    
    this.newElement(tag, data, children, '__VUE_WEB_BUILDER_1__').ifPresent((ele: VueNode)=>{
      this.nodes.set(`__VUE_WEB_BUILDER_${ele.id}__`, ele)
      this.vm.setNodes(this.nodes)
    })
    
  }
  addIcon(){
    this.addElement("v-icon", {}, ["home"])
  }
  addBtn(){
    this.addElement("v-btn", {}, ["btn"])
  }
  addToolbar(){
    this.addElement("v-toolbar", {}, ["ToolBar"])
  }

  newToolbar(event: DragEvent): void {
    this.newElement("v-toolbar", {}).ifPresent((node: VueNode)=>{
      node.id = -1
      event.dataTransfer.setData("text/plain", JSON.stringify(node))
    })
  }

  newBtn(event: DragEvent): void {
    this.newElement("v-btn", {}).ifPresent((node: VueNode)=>{
      const parentNode = this.nodes.get(node.parentId)
      parentNode.childrenId = parentNode.childrenId.filter(()i => i != `__VUE_WEB_BUILDER_${node.id}__`)
      this.nodes.set(node.parentId, parentNode)
      node.parentId = ""
      event.dataTransfer.setData("text/plain", JSON.stringify(node))
    })
  }

  dragStart(item: VueNode, event: DragEvent){
    event.stopPropagation();
    const data = event.dataTransfer.getData("text/plain");
    if(data != ""){
      try {
        const d = JSON.parse(data)
        if(d.id == item.id){
          return 
        }
      } catch (error) {
        return 
      }
    }
    
    event.dataTransfer.setData("text/plain", JSON.stringify(item))
    console.log("start", item, event)
  }

  dragEnd(item: VueNode, event: DragEvent){
    event.stopPropagation();
    event.dataTransfer.setData("text/plain", "")
    // this.vm.setNodes(this.nodes)
    console.log("end",item, event)
  }

  dragEnter(item: VueNode, event: DragEvent){
    event.stopPropagation();
    if(!event.target.classList.contains("drag-enter")){
      event.target.classList.add("drag-enter")
    }
    console.log("enter", item, event)
  }

  dragLeave(item: VueNode, event: DragEvent){
    event.stopPropagation();
    if(event.target.classList.contains("drag-enter")){
      event.target.classList.remove("drag-enter")
    }
    console.log("leave", item, event)
  }

  drop(item: VueNode, event: DragEvent): void{
    event.stopPropagation();
    const ele: VueNode = JSON.parse(event.dataTransfer.getData("text/plain"))
    ele.attr.nativeOn = {
      dragstart: ($event: DragEvent)=> this.dragStart(ele, $event),
      dragend: ($event: DragEvent)=> this.dragEnd(ele, $event),
      dragenter: ($event: DragEvent)=> this.dragEnter(ele, $event),
      dragleave: ($event: DragEvent)=> this.dragLeave(ele, $event),
      drop: ($event: DragEvent)=> this.drop(ele, $event),
      dragover: ($event: DragEvent)=> $event.preventDefault(),
    }
    if(ele.parentId == ""){
      console.log("new", ele)
      ele.parentId = `__VUE_WEB_BUILDER_${item.id}__`
      this.nodes.set(`__VUE_WEB_BUILDER_${ele.id}__`, ele)
      this.nodes.get(`__VUE_WEB_BUILDER_${item.id}__`).childrenId.push(`__VUE_WEB_BUILDER_${ele.id}__`)
    }else{
      if(this.isSort){
        const parent = Optional.ofNullable(this.nodes.get(`__VUE_WEB_BUILDER_${ele.id}__`)).map(()e => e.parentId).orElse(`__VUE_WEB_BUILDER_-1__`)
        if(item.parentId != parent) return
        Optional.ofNullable(this.nodes.get(item.parentId)).ifPresent((node: VueNode)=>{
          const dragIndex = node.childrenId.indexOf(`__VUE_WEB_BUILDER_${ele.id}__`)
          const dropIndex = node.childrenId.indexOf(`__VUE_WEB_BUILDER_${item.id}__`)

          node.childrenId.splice(dragIndex, 1)
          node.childrenId.splice(dropIndex, 0, `__VUE_WEB_BUILDER_${ele.id}__`)
        })
      }
      else {
        const beforeParent = this.nodes.get(`__VUE_WEB_BUILDER_${ele.id}__`).parentId
        const cIds = this.nodes.get(beforeParent).childrenId
        this.nodes.get(beforeParent).childrenId.splice(cIds.indexOf(`__VUE_WEB_BUILDER_${ele.id}__`), 1)
        this.nodes.get(`__VUE_WEB_BUILDER_${ele.id}__`).parentId = `__VUE_WEB_BUILDER_${item.id}__`
        this.nodes.get(`__VUE_WEB_BUILDER_${item.id}__`).childrenId.push(`__VUE_WEB_BUILDER_${ele.id}__`)
      }
    }
    
    event.target.classList.remove("drag-enter")
    this.vm.setNodes(this.nodes)
    console.log("drop", item, event)
  }
  mounted(){
    const head: HTMLElement = this.document.head;
    head.appendChild(this.createLink('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons'));
    head.appendChild(this.createLink('https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css'));
    head.appendChild(this.createLink('https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css'));
    const styles = new Map<string, string>()
    styles.set("border", "5px solid red")
    head.appendChild(this.createStyle([
      { selector: '.drag-enter', styles }
    ]));
    this.document.body.appendChild(this.rootElement);
    this.vm = new LocalVue(this.rootElement)
    this.vm.setNodes(this.nodes)
  }

  get iframe(): Optional<HTMLIFrameElement> {
    const iframe:HTMLIFrameElement|null  = this.$el.querySelector("iframe")
    return Optional.ofNullable(iframe)
  }
  get window(): Optional<Window> {
    const w: Window|null = this.iframe.map(()i => i.contentWindow).orElse(null)
    return Optional.ofNullable(w)
  }

  get document(): Document {
    return this.window.map(()w => w.document).get()
  }

  createScript(src: string): HTMLScriptElement {
    const script = document.createElement("script")
    script.setAttribute("src", src)
    return script
  }

  createLink(link: string): HTMLLinkElement {
    const ele = document.createElement("link")
    ele.setAttribute("href", link)
    ele.setAttribute("rel", "stylesheet")
    return ele
  }

  createStyle(rules: styleRule[]): HTMLStyleElement {
    const ele = document.createElement("style")
    ele.innerHTML = rules.map((rul)e => {
      const style: string = Array.from(rule.styles.keys()).map( (k: string) => `${k}: ${rule.styles.get(k)};`).join("\n")
      return `${rule.selector} {\n ${style}\n}`
    }).join("\n")
    return ele
  }

}
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>

