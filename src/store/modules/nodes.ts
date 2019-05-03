import { editTargetSubject } from "@/observer/";
import {
  Mutation,
  VuexModule,
  getModule,
  Module
} from "vuex-module-decorators";
import store from "@/store/";
import Optional from "typescript-optional";
import uuid from "uuid";
import Vue from "vue";
import { IVueNode, INodesState } from "@/types";
import { DragItem } from "@/domain/model/DragItem";
import clone from "lodash.clonedeep";
@Module({ dynamic: true, store, name: "nodes", namespaced: true })
class Nodes extends VuexModule implements INodesState {
  // state
  public nodes: { [id: string]: IVueNode } = {};
  public draggingId: string = "";
  public dropTargetId: string = "";
  public isSort: boolean = true;
  public hoverId: string = "";
  public editTargetId: string = "";
  public components: string[] = [];
  public newCmpName: string = "";
  public dragItem: DragItem = new DragItem({});

  // mutation
  @Mutation
  public UPDATE_TEXT(text: string) {
    const targetNode = this.nodes[this.editTargetId];
    const index: number = targetNode.childrenId.findIndex(
      i => this.nodes[i] === undefined
    );

    const newNodes = clone(this.nodes);
    const numOfItem = newNodes[this.editTargetId].childrenId.length;
    const targetIndex = index < 0 ? numOfItem : index;
    newNodes[this.editTargetId].childrenId[targetIndex] = text;
    this.nodes = newNodes;
  }

  @Mutation
  public UPDATE_STYLE(styles: { [props: string]: string }) {
    const newNodes = clone(this.nodes);
    newNodes[this.editTargetId].attr.style = styles;
    this.nodes = newNodes;
    editTargetSubject.next(NodesModule.editTarget);
  }

  @Mutation
  public UPDATE_ATTRIBUTE(attrs: { [props: string]: string }) {
    const newNodes = clone(this.nodes);
    newNodes[this.editTargetId].attr.attrs = attrs;
    this.nodes = newNodes;
    editTargetSubject.next(NodesModule.editTarget);
  }

  @Mutation
  public CREATE_ELEMENT_IN(parentId: string) {
    if (this.nodes[parentId] === undefined) {
      return;
    }
    const node: IVueNode = {
      id: uuid.v4(),
      attr: {
        class: [],
        style: {},
        attrs: {}
      },
      parentId,
      childrenId: [],
      tag: this.newCmpName
    };
    const newNodes: { [id: string]: IVueNode } = clone(this.nodes);
    newNodes[node.parentId].childrenId.push(node.id);
    newNodes[node.id] = node;
    this.nodes = newNodes;
  }

  @Mutation
  public SET_NEW_COMPONENT_NAME(name: string) {
    this.newCmpName = name;
  }

  @Mutation
  public REMOVE_NEW_COMPONENT_NAME(name: string) {
    if (this.newCmpName === name) {
      this.newCmpName = "";
    }
  }

  @Mutation
  public SET_COMPONENTS(components: string[]) {
    this.components = components;
  }

  @Mutation
  public SET_EDIT_TARGET(id: string) {
    this.editTargetId = id;
    editTargetSubject.next(NodesModule.editTarget);
  }

  @Mutation
  public REMOVE_NODE(id: string) {
    if (!this.nodes[id]) {
      return;
    }
    const node = this.nodes[id];
    const parent = this.nodes[node.parentId];
    if (parent) {
      parent.childrenId = parent.childrenId.filter(
        childId => childId !== node.id
      );
    }
    Vue.delete(this.nodes, id);
  }

  @Mutation
  public SET_NODES(nodes: { [id: string]: IVueNode }) {
    this.nodes = nodes;
  }

  @Mutation
  public ADD_NODE(node: IVueNode) {
    node.id = uuid.v4();
    const newNodes = clone(this.nodes);
    newNodes[node.parentId].childrenId.push(node.id);
    newNodes[node.id] = node;
    this.nodes = newNodes;
  }

  @Mutation
  public SET_HOVER_ELEMENT(id: string) {
    this.hoverId = id;
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public REMOVE_HOVER_ELEMENT(id: string) {
    if (id === this.hoverId) {
      this.hoverId = "";
      this.dragItem = new DragItem({
        hoverId: this.hoverId,
        draggingId: this.draggingId,
        dropTargetId: this.dropTargetId
      });
    }
  }

  @Mutation
  public DRAG_START(id: string) {
    this.draggingId = id;
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public DRAG_END() {
    this.draggingId = "";
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public DRAG_ENTER(id: string) {
    this.draggingId = "";
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public DRAG_LEAVE() {
    this.draggingId = "";
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public SET_DROP_TARGET(id: string) {
    this.dropTargetId = id;
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }
  @Mutation
  public REMOVE_DROP_TARGET(id: string) {
    this.dropTargetId = this.dropTargetId === id ? "" : this.dropTargetId;
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }

  @Mutation
  public MOVE_ELEMENT_IN({
    eleId,
    targetId
  }: {
    eleId: string;
    targetId: string;
  }) {
    if (eleId === targetId) {
      return;
    }
    const n: IVueNode | undefined = this.nodes[eleId];
    const t: IVueNode | undefined = this.nodes[targetId];
    if (n === undefined || t === undefined) {
      return;
    }
    // remove from current parent
    Optional.ofNullable(this.nodes[n.parentId]).ifPresent(
      (parent: IVueNode) => {
        parent.childrenId = parent.childrenId.filter(i => i !== n.id);
        this.nodes[parent.id] = parent;
      }
    );
    // add to taget element
    n.parentId = t.id;
    t.childrenId.push(n.id);
    const newNodes = clone(this.nodes);
    newNodes[n.id] = n;
    newNodes[t.id] = t;
    this.nodes = newNodes;
  }

  @Mutation
  public MOVE_ELEMENT_TO({
    eleId,
    targetId
  }: {
    eleId: string;
    targetId: string;
  }) {
    if (eleId === targetId) {
      return;
    }
    const n: IVueNode | undefined = this.nodes[eleId];
    const t: IVueNode | undefined = this.nodes[targetId];
    if (n === undefined || t === undefined) {
      return;
    }
    if (n.parentId !== t.parentId) {
      return;
    }
    const p: IVueNode | undefined = this.nodes[n.parentId];
    if (p === undefined) {
      return;
    }

    const nIndex: number = p.childrenId.indexOf(n.id);
    const tIndex: number = p.childrenId.indexOf(t.id);

    p.childrenId.splice(nIndex, 1); // remove fromlist
    p.childrenId.splice(tIndex, 0, n.id);

    const newNodes = clone(this.nodes);
    newNodes[p.id] = p;
    this.nodes = newNodes;
  }

  @Mutation
  public SET_IS_SORT(v: boolean) {
    this.isSort = v;
  }

  // getter
  get topNodes(): IVueNode[] {
    return Object.keys(this.nodes)
      .filter((id: string) => this.nodes[id].parentId === "")
      .map((id: string) => this.nodes[id]);
  }

  get allNodes(): { [id: string]: IVueNode } {
    return this.nodes;
  }

  get editTarget(): IVueNode {
    return Optional.ofNullable(this.nodes[this.editTargetId]).orElse({
      id: "",
      attr: {
        class: [],
        style: {},
        attrs: {}
      },
      childrenId: [],
      parentId: "",
      tag: ""
    });
  }
}

const NodesModule = getModule(Nodes);
export default NodesModule;
