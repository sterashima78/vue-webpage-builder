import { nodeSubject, mouseSubject, editTargetSubject } from "@/observer/";
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
    if (index < 0) {
      this.nodes[this.editTargetId].childrenId.push(text);
    } else {
      this.nodes[this.editTargetId].childrenId[index] = text;
    }
    nodeSubject.next(this.nodes);
    editTargetSubject.next(NodesModule.editTarget);
  }
  @Mutation
  public UPDATE_STYLE(styles: { [props: string]: string }) {
    this.nodes[this.editTargetId].attr.style = styles;
    nodeSubject.next(this.nodes);
    editTargetSubject.next(NodesModule.editTarget);
  }
  @Mutation
  public UPDATE_ATTRIBUTE(attrs: { [props: string]: string }) {
    this.nodes[this.editTargetId].attr.attrs = attrs;
    nodeSubject.next(this.nodes);
    editTargetSubject.next(NodesModule.editTarget);
  }
  @Mutation
  public CREATE_ELEMENT_IN(parentId: string) {
    if (this.nodes[parentId] === undefined) {
      return;
    }
    const node: IVueNode = {
      id: "",
      attr: {
        class: [],
        style: {},
        attrs: {}
      },
      parentId,
      childrenId: [],
      tag: this.newCmpName
    };
    node.id = uuid.v4();
    this.nodes[node.parentId].childrenId.push(node.id);
    this.nodes[node.id] = node;
    nodeSubject.next(this.nodes);
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
    nodeSubject.next(this.nodes);
  }

  @Mutation
  public SET_NODES(nodes: { [id: string]: IVueNode }) {
    this.nodes = nodes;
    nodeSubject.next(this.nodes);
  }

  @Mutation
  public SEND_NDOES() {
    nodeSubject.next(this.nodes);
  }

  @Mutation
  public ADD_NODE(node: IVueNode) {
    node.id = uuid.v4();
    this.nodes[node.parentId].childrenId.push(node.id);
    this.nodes[node.id] = node;
    nodeSubject.next(this.nodes);
  }

  @Mutation
  public SET_HOVER_ELEMENT(id: string) {
    this.hoverId = id;
    broadcastMouse();
  }

  @Mutation
  public REMOVE_HOVER_ELEMENT(id: string) {
    if (id === this.hoverId) {
      this.hoverId = "";
      broadcastMouse();
    }
  }

  @Mutation
  public DRAG_START(id: string) {
    this.draggingId = id;
    broadcastMouse();
  }

  @Mutation
  public DRAG_END() {
    this.draggingId = "";
    broadcastMouse();
  }

  @Mutation
  public DRAG_ENTER(id: string) {
    this.draggingId = "";
    broadcastMouse();
  }

  @Mutation
  public DRAG_LEAVE() {
    this.draggingId = "";
    broadcastMouse();
  }

  @Mutation
  public UPDATE_DRAGITEM() {
    this.dragItem = new DragItem({
      hoverId: this.hoverId,
      draggingId: this.draggingId,
      dropTargetId: this.dropTargetId
    });
  }
  @Mutation
  public SET_DROP_TARGET(id: string) {
    this.dropTargetId = id;
    broadcastMouse();
  }
  @Mutation
  public REMOVE_DROP_TARGET(id: string) {
    this.dropTargetId = this.dropTargetId === id ? "" : this.dropTargetId;
    broadcastMouse();
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
    this.nodes[n.id] = n;
    this.nodes[t.id] = t;
    nodeSubject.next(this.nodes);
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

    this.nodes[p.id] = p;
    nodeSubject.next(this.nodes);
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

const broadcastMouse = (): void => {
  mouseSubject.next({
    hoverId: NodesModule.hoverId,
    draggingId: NodesModule.draggingId,
    dropTargetId: NodesModule.dropTargetId
  });
  NodesModule.UPDATE_DRAGITEM();
};

const NodesModule = getModule(Nodes);
export default NodesModule;
