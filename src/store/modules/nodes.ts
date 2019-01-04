import { Mutation, MutationAction, Action, VuexModule, getModule, Module } from 'vuex-module-decorators';
import {VNodeData} from 'vue';
import store from '@/store/';
import Optional from 'typescript-optional';
import uuid from 'uuid';
import Vue from 'vue';
export interface IVueNode {
  id: string;
  tag: string;
  attr: VNodeData;
  childrenId: string[];
  parentId: string;
}

export interface IVueNodeTree {
  id: string;
  name: string;
  children: IVueNodeTree[];
}

export interface INodesState {
  nodes: {
    [id: string]: IVueNode,
  };
}

@Module({ dynamic: true, store, name: 'nodes', namespaced: true })
class Nodes extends VuexModule implements INodesState {
   // state
   public nodes: {[id: string]: IVueNode} = {};
   public draggingId: string = '' ;
   public dropTargetId: string = '';
   public isSort: boolean = true;
   public hoverId: string = '';

   // mutation
   @Mutation
   public REMOVE_NODE(id: string) {
     if (!this.nodes[id]) { return; }
     const node = this.nodes[id];
     const parent = this.nodes[node.parentId];
     if (parent) {
      parent.childrenId = parent.childrenId.filter((childId) => childId !== node.id);
    }
     Vue.delete(this.nodes, id);
   }

   @Mutation
   public SET_NODES(nodes: {[id: string]: IVueNode}) {
     this.nodes = nodes;
   }
   @Mutation
   public ADD_NODE(node: IVueNode) {
    node.id = uuid.v4();
    this.nodes[node.parentId].childrenId.push(node.id);
    this.nodes[node.id] = node;
   }

   @Mutation
   public SET_HOVER_ELEMENT(id: string) {
     this.hoverId = id;
   }

   @Mutation
   public REMOVE_HOVER_ELEMENT(id: string) {
     if (id === this.hoverId) {
      this.hoverId = '';
     }
   }

   @Mutation
   public DRAG_START(id: string) {
     this.draggingId = id;
   }

   @Mutation
   public DRAG_END() {
     this.draggingId = '';
   }

   @Mutation
   public DRAG_ENTER(id: string) {
     this.draggingId = '';
   }

   @Mutation
   public DRAG_LEAVE() {
     this.draggingId = '';
   }

   @Mutation
   public SET_DROP_TARGET(id: string) {
     this.dropTargetId = id;
   }
   @Mutation
   public REMOVE_DROP_TARGET(id: string) {
     this.dropTargetId = this.dropTargetId === id ? '' : this.dropTargetId;
   }

   @Mutation
   public MOVE_ELEMENT_IN({eleId, targetId}: {eleId: string,  targetId: string}) {
    if (eleId === targetId) { return; }
    const n: IVueNode|undefined = this.nodes[eleId];
    const t: IVueNode|undefined = this.nodes[targetId];
    if (n === undefined || t === undefined) { return; }
    // remove from current parent
    Optional.ofNullable(this.nodes[n.parentId])
            .ifPresent((parent: IVueNode) => {
              parent.childrenId = parent.childrenId.filter((i) => i !== n.id );
              this.nodes[parent.id] = parent;
            });
    // add to taget element
    n.parentId = t.id;
    t.childrenId.push(n.id);
    this.nodes[n.id] = n;
    this.nodes[t.id] = t;
   }

   @Mutation
   public MOVE_ELEMENT_TO({eleId, targetId}: {eleId: string,  targetId: string}) {
    if (eleId === targetId) { return; }
    const n: IVueNode|undefined = this.nodes[eleId];
    const t: IVueNode|undefined = this.nodes[targetId];
    if (n === undefined || t === undefined) { return; }
    if (n.parentId !== t.parentId) { return; }
    const p: IVueNode|undefined = this.nodes[n.parentId];
    if (p === undefined) { return; }

    const nIndex: number = p.childrenId.indexOf(n.id);
    const tIndex: number = p.childrenId.indexOf(t.id);

    p.childrenId.splice(nIndex, 1); // remove fromlist
    p.childrenId.splice(tIndex, 0, n.id);

    this.nodes[p.id] =  p;
   }

   @Mutation
   public SET_IS_SORT(v: boolean) {
     this.isSort = v;
   }


  // getter
  get topNodes(): IVueNode[] {
    return Object.keys(this.nodes)
          .filter( (id: string) => this.nodes[id].parentId === '')
          .map( (id: string) => this.nodes[id]);
  }

  get allNodes(): {[id: string]: IVueNode} {
    return this.nodes;
  }

  get tree(): IVueNodeTree[] {
    return this.topNodes
            .map((node) => buildTree(node))
            .filter((n) => n.id !== '');
  }
}

const buildTree = (node: IVueNode): IVueNodeTree => {
  return {
    id: node.id,
    name: node.tag,
    children: node.childrenId.reduce( (arr: IVueNodeTree[] , id: string): IVueNodeTree[] => {
      if (!NodesModule.nodes[id]) { return arr; }
      arr.push(buildTree(NodesModule.nodes[id]));
      return arr;
    }, []),
  };
};
const NodesModule = getModule(Nodes);
export default NodesModule;
