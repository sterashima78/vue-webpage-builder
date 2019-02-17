import Vue, { CreateElement, VNode, VNodeData, VueConstructor } from "vue";
import { nodeSubject, mouseSubject } from "@/observer/";
import Optional from "typescript-optional";
import clone from "lodash.clonedeep";
import Nodes, { IVueNode } from "@/store/modules/nodes";
import uuid from "uuid";
import {
  dragStart,
  dragEnd,
  dragEnter,
  mouseEnter,
  mouseLeave,
  drop
} from "./NodeUtils";

export default class LocalVue {
  public vm: Vue;
  constructor(ele: Element, VueJs: VueConstructor<Vue>) {
    this.vm = new VueJs({
      el: ele,
      data() {
        return {
          topNodes: [] as IVueNode[],
          allNodes: {} as { [id: string]: IVueNode },
          dropTargetId: "" as string,
          hoverId: "" as string
        };
      },
      created() {
        nodeSubject.subscribe(nodes => {
          this.allNodes = nodes;
          this.topNodes = Object.keys(nodes)
            .filter((id: string) => nodes[id].parentId === "")
            .map((id: string) => nodes[id]);
        });
        mouseSubject.subscribe(({ dropTargetId, hoverId }) => {
          this.dropTargetId = dropTargetId;
          this.hoverId = hoverId;
        });
      },
      mounted() {
        initialize();
      },
      render(h: CreateElement): VNode {
        return h("div", this.topNodes.map(n => this.rRender(n.id)));
      },
      methods: {
        rRender(id: string): VNode {
          return Optional.ofNullable(clone(this.allNodes[id]))
            .map((n: IVueNode) => {
              const isDropTarget = n.id === this.dropTargetId;
              const isHover = n.id === this.hoverId;
              const attr = genAttr(n, isDropTarget, isHover);
              const vnode = this.$createElement(
                n.tag,
                attr,
                n.childrenId.map((i: string) => this.rRender(i))
              );
              return vnode;
            })
            .orElse(id);
        }
      }
    });
    // @ts-ignore
    Nodes.SET_COMPONENTS(Object.keys(VueJs.options.components));
  }
  public update(): void {
    this.vm.$forceUpdate();
  }
}

const initialize = () => {
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
};
const genAttr = (
  node: IVueNode,
  isDropTarget: boolean,
  isHover: boolean
): VNodeData => {
  const attr = addListener(node.attr);
  if (!attr.domProps) {
    attr.domProps = {};
  }
  attr.domProps.__VUE_WEB_BUILDER_ID__ = node.id;
  attr.domProps.draggable = true;
  if (!attr.class) {
    attr.class = [];
  }
  if (isDropTarget) {
    attr.class.push("drag-enter");
  }

  if (isHover) {
    attr.class.push("vue-web-builder-hover");
  }
  return attr;
};
const addListener = (attr: VNodeData) => {
  if (!attr.on) {
    attr.on = {};
  }
  attr.on.dragstart = ($event: DragEvent) => dragStart($event);
  attr.on.dragend = ($event: DragEvent) => dragEnd($event);
  attr.on.dragenter = ($event: DragEvent) => dragEnter($event);
  attr.on.drop = ($event: DragEvent) => drop($event);
  attr.on.dragover = ($event: DragEvent) => $event.preventDefault();
  attr.on.mouseenter = ($event: DragEvent) => mouseEnter($event);
  attr.on.mouseleave = ($event: DragEvent) => mouseLeave($event);

  return attr;
};
