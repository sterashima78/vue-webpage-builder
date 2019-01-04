<template>
<v-layout>
  <iframe style="width:100%;height:100%" />
  <div style="width: 300px">
    <v-switch
      :label="isSort ? 'ソートモード' : 'Addモード'"
      :value="isSort"
      @change="setIsSort(!!$event)"
    ></v-switch>
    <v-tabs v-model="active">
      <v-tab ripple><v-icon>layers</v-icon></v-tab>
      <v-tab ripple><v-icon>dashboard</v-icon></v-tab>
      <v-tab ripple><v-icon>tune</v-icon></v-tab>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            <v-treeview :items="tree" :hoverable="true">
              <template slot="label" slot-scope="{ item, open, leaf }">
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
              <template slot="append" slot-scope="{ item, open, leaf }">
                <v-icon @click="deleteNode(item.id)">delete</v-icon>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
            
            <v-btn @click="addToolbar">Add toolbar</v-btn>
            <v-btn @click="addBtn">Add btn</v-btn>
            <v-btn @click="addIcon">Add Icon</v-btn>
            <v-btn @click="addLayout">Add Layout</v-btn>

            <!-- <div @dragstart="newBtn" draggable="true">new btn</div> -->
            <!-- <div @dragstart="newToolbar" draggable="true">new toolbar</div> -->
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <v-card-text>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
    
  </div>
</v-layout>
</template>

<script lang="ts">
import VueJS from 'vue';
import {CreateElement, VNode, VNodeData } from 'vue';
import Vuetify from 'vuetify';
VueJS.use(Vuetify);

import { Component, Vue, Watch } from 'vue-property-decorator';
import Optional from 'typescript-optional';

import cloneDeep from 'lodash.clonedeep';
import merge from 'lodash.merge';

import Iframe, {StyleRule} from '../util/Iframe';
import LocalVue from '../util/LocalVue';

import Nodes from '../store/modules/nodes';

@Component
export default class Viewer extends Vue {
  public iframe: Iframe = new Iframe(document.createElement('iframe'));
  public rootElement: HTMLElement = document.createElement('div');
  public vm: any = {};
  public active: string = '';
  public treeDragItem: string = '';

  get isSort() {
    return Nodes.isSort;
  }

  get tree() {
    return Nodes.tree;
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

      this.iframe.document.body.appendChild(this.rootElement);
      this.vm = new LocalVue(this.rootElement);
    });
  }

}
</script>

<style>
.drag-enter {
  border: 5px solid red !important;
}
</style>

