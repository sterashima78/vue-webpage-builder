<template>
<v-layout>
  <iframe style="width:100%;height:100%" />
  <div style="width: 300px">
    <v-tabs v-model="active">
      <v-tab ripple><v-icon>layers</v-icon></v-tab>
      <v-tab ripple><v-icon>dashboard</v-icon></v-tab>
      <v-tab ripple><v-icon>tune</v-icon></v-tab>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-switch
              :label="isSort ? 'ソートモード' : 'Addモード'"
              :value="isSort"
              @change="setIsSort(!!$event)"
            ></v-switch>
            <v-treeview :items="tree" :hoverable="true">
              <template slot="label" slot-scope="{ item }">
                <div 
                  draggable="true" 
                  style="cursor: move" 
                  @dragstart="treeDragStart(item.id)" 
                  @drop="treeDrop(item.id)" 
                  @dragover="$event.preventDefault()"
                  @mouseenter="treeMouseEnter(item.id)"
                  @mouseleave="treeMouseLeave(item.id)"
                >{{item.name}}</div>
              </template>
              <template slot="append" slot-scope="{ item }">
                <v-icon @click="openAttrEditor(item.id)">tune</v-icon>
                <v-icon @click="deleteNode(item.id)">delete</v-icon>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat style="overflow-y: scroll; height: calc(100vh - 50px);">
          <v-card-text>
            <v-text-field v-model="filter" label="フィルター" />
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
                  >{{name}}
                  </v-sheet>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text v-if="editTarget.tag">
            <div><h2>{{editTarget.tag}}</h2></div>
            <div>
              <v-combobox
                  :value="editTarget.attr ? editTarget.attr.class : []"
                  :items="[]"
                  :search-input.sync="search"
                  hide-selected
                  multiple
                  small-chips
                  label="class"
                >
                </v-combobox>
            </div>
            <div>
              <v-text-field :value="editTargetText" label="テキスト" @input="updateText($event)"/>
            </div>
            <div>
              <div></div>
            </div>
          </v-card-text>
          <v-card-text v-else>
            <a @click="active = 0" style="cursor: pointer">レイヤータブ</a>から編集対象を選択してください
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
    
  </div>
</v-layout>
</template>

<script lang="ts">
import {CreateElement, VNode, VNodeData } from 'vue';

import { Component, Vue, Watch } from 'vue-property-decorator';
import Optional from 'typescript-optional';

import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';

import Iframe, {StyleRule} from '../util/Iframe';
import LocalVue from '../util/LocalVue';

import Nodes, { IVueNode } from '../store/modules/nodes';

export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}

@Component
export default class Viewer extends Vue {
  public iframe: Iframe = new Iframe(document.createElement('iframe'));
  public rootElement: HTMLElement = document.createElement('div');
  public vm: any = {};
  public active: number = 0;
  public treeDragItem: string = '';
  public search = null;
  public filter = '';

  get isSort() {
    return Nodes.isSort;
  }

  get tree() {
    this.allNodes
    console.log(this.allNodes)
    return Object.keys(this.allNodes).filter( (id: string) => this.allNodes[id].parentId === '')
            .map( (id: string) => this.allNodes[id])
            .map((node) => this.buildTree(node))
            .filter((n) => n.id !== '');;
  }
  public buildTree(node: IVueNode): IVueNodeTree{
    console.log("build", node)
    return {
      id: node.id,
      name: node.tag,
      children: node.childrenId.reduce( (arr: IVueNodeTree[] , id: string): IVueNodeTree[] => {
        console.log(id, this.allNodes[id])
        if (!this.allNodes[id]) { return arr; }
        arr.push(this.buildTree(this.allNodes[id]));
        return arr;
      }, []),
    };
  };

  get allNodes() {
    return Nodes.allNodes;
  }

  get editTarget() {
    return Nodes.editTarget;
  }

  get editTargetText() {
    const c = this.editTarget.childrenId.filter( (i) => undefined === Nodes.nodes[i]);
    return c.length === 0 ? '' : c[0];
  }

  get editTargetAttr() {
    const a = this.editTarget.attr;
    return a === undefined ? {} : a;
  }

  public get allComponents(): string[] {
    return Nodes.components;
  }

  public get filteredComponents(): string[] {
    return Nodes.components.filter( (c) => (new RegExp(this.filter, 'i')).test(c));
  }

  public updateText(text: string) {
    Nodes.UPDATE_TEXT(text);
    this.vm.update();
    this.$forceUpdate();
  }

  public cmpDragStart(name: string) {
    Nodes.SET_NEW_COMPONENT_NAME(name);
  }

  public cmpDragEnd(name: string) {
    Nodes.REMOVE_NEW_COMPONENT_NAME(name);
  }

  public openAttrEditor(id: string) {
    this.active = 2;
    Nodes.SET_EDIT_TARGET(id);
  }

  public treeDragStart(id: string) {
    this.treeDragItem = id;
  }

  public treeDrop(id: string) {
    if (id === this.treeDragItem) { return ; }
    if (Nodes.isSort) {
      Nodes.MOVE_ELEMENT_TO({eleId: this.treeDragItem, targetId: id});
    } else {
      Nodes.MOVE_ELEMENT_IN({eleId: this.treeDragItem, targetId: id});
    }
    this.vm.update();
    this.treeDragItem = '';
  }

  public treeMouseEnter(id: string) {
    Nodes.SET_HOVER_ELEMENT(id);
  }

  public treeMouseLeave(id: string) {
    Nodes.REMOVE_HOVER_ELEMENT(id);
  }

  public deleteNode(id: string) {
    Nodes.REMOVE_NODE(id);
  }

  public setIsSort(v: boolean) {
    Nodes.SET_IS_SORT(v);
  }

  public addIcon() {
    Nodes.ADD_NODE({
      id: '',
      parentId: Nodes.topNodes[0].childrenId[0],
      childrenId: ['home'],
      attr: {},
      tag: 'v-icon',
    });
  }
  public addBtn() {
    Nodes.ADD_NODE({
      id: '',
      parentId: Nodes.topNodes[0].childrenId[0],
      childrenId: ['added btn'],
      attr: {},
      tag: 'v-btn',
    });
  }
  public addToolbar() {
    Nodes.ADD_NODE({
      id: '',
      parentId: Nodes.topNodes[0].childrenId[0],
      childrenId: ['ToolBar'],
      attr: {},
      tag: 'v-toolbar',
    });
  }
  public addLayout() {
    Nodes.ADD_NODE({
      id: '',
      parentId: Nodes.topNodes[0].childrenId[0],
      childrenId: [],
      attr: {class: ['layout']},
      tag: 'div',
    });
  }


  public mounted() {
    Optional.ofNullable(this.$el.querySelector('iframe')).ifPresent((ele: HTMLIFrameElement) => {
      this.iframe = new Iframe(ele);
      this.iframe.addLink('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons');
      this.iframe.addLink('https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.min.css');
      const styles = new Map<string, string>();
      styles.set('border', '5px solid red');
      styles.set('box-sizing', 'border-box');

      const styles2 = new Map<string, string>();
      styles2.set('border', '5px solid blue');
      styles2.set('box-sizing', 'border-box');

      this.iframe.addStyle([
        { selector: '.drag-enter', styles },
        { selector: '.vue-web-builder-hover', styles: styles2 },
      ]);
      this.iframe.addScript('https://cdn.jsdelivr.net/npm/vue/dist/vue.js')
          .then(()=>{
            return this.iframe.addScript('https://cdn.jsdelivr.net/npm/vuetify/dist/vuetify.js');
          })
          .then(()=>{
            this.iframe.document.body.appendChild(this.rootElement);
            console.log(this.iframe.window.get())
            this.vm = new LocalVue(this.rootElement, this.iframe.window.get().Vue);
            
          })
    });
  }

}
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>

