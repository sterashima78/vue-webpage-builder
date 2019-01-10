import Vue, {CreateElement, VNode, VNodeData, VueConstructor } from 'vue';
import Emitter from "../util/Emitter"

import Optional from 'typescript-optional';
import clone from 'lodash.clonedeep';
import Nodes from '@/store/modules/nodes';
import uuid from 'uuid';
interface VueWebBuilderElement extends HTMLElement {
  __VUE_WEB_BUILDER_ID__: string;
  parentElement: VueWebBuilderElement;
}


export default class LocalVue {

  public static targetNodeIdEqualsTo(target: VueWebBuilderElement, id: string): boolean {
    return this.getNodeId(target) === id;
  }

  public static getNodeId(target: VueWebBuilderElement|null): string {
    const ele = this.getNode(target);
    if (ele === null) { return ''; }
    return ele.__VUE_WEB_BUILDER_ID__;
  }
  public static getNode(target: VueWebBuilderElement|null): VueWebBuilderElement|null {
    if (target === null) { return null; }
    if (target.__VUE_WEB_BUILDER_ID__ !== undefined) { return target; }

    if (target.parentElement === null) { return null; }
    if (target.parentElement.__VUE_WEB_BUILDER_ID__ === undefined) { return this.getNode(target.parentElement); }
    return target.parentElement;

  }

  public static dragStart(event: DragEvent): void {
    event.stopPropagation();

    if (this.targetNodeIdEqualsTo(event.target as VueWebBuilderElement, Nodes.draggingId)) { return; }
    Nodes.DRAG_START(this.getNodeId(event.target as VueWebBuilderElement));
    Optional.ofNullable(event.dataTransfer).ifPresent((transfer) => {
      const id = this.getNodeId(event.target as VueWebBuilderElement);
      transfer.setData('text/plain', id);
    });
  }

  public static dragEnd(event: DragEvent) {
    event.stopPropagation();
    Optional.ofNullable(event.dataTransfer).ifPresent((transfer) => {
      transfer.setData('text/plain', '');
    });
    Nodes.DRAG_END();
  }

  public static dragEnter(event: DragEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      event.stopPropagation();
      Nodes.SET_DROP_TARGET(id);
    });
  }

  public static dragLeave(event: DragEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      event.stopPropagation();
      Nodes.REMOVE_DROP_TARGET(id);
    });
  }
  public static mouseEnter(event: MouseEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      event.stopPropagation();
      Nodes.SET_HOVER_ELEMENT(id);
    });
  }

  public static mouseLeave(event: MouseEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      event.stopPropagation();
      Nodes.REMOVE_HOVER_ELEMENT(id);
    });
  }

  public static drop(event: DragEvent) {
    event.stopPropagation();
    if (Nodes.draggingId !== '' ) {
      this.dropFromCanvas(event);
      return;
    }

    if (Nodes.newCmpName !== '' ) {
      this.dropFromTab(event);
      return;
    }
  }

  private static dropFromTab(event: DragEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      Nodes.CREATE_ELEMENT_IN(id);
      Nodes.REMOVE_DROP_TARGET(id);
    });
  }

  private static dropFromCanvas(event: DragEvent) {
    Optional.ofNullable(this.getNodeId(event.target as VueWebBuilderElement)).ifPresent( (id: string) => {
      Nodes.REMOVE_DROP_TARGET(id);
    });
    Optional.ofNullable(event.dataTransfer).map((transfer) => {
      return transfer.getData('text/plain');
    }).ifPresent((nodeId: string) => {
      const node = Nodes.nodes[nodeId];
      const id = this.getNodeId(event.target as VueWebBuilderElement);
      if (node.parentId === '') {
        Nodes.MOVE_ELEMENT_IN({eleId: node.id, targetId: id});
      } else {
        if (Nodes.isSort) {
          Nodes.MOVE_ELEMENT_TO({eleId: node.id, targetId: id});
        } else {
          Nodes.MOVE_ELEMENT_IN({eleId: node.id, targetId: id});
        }
      }
    });
  }

  public vm: Vue;
  constructor(ele: Element, VueJs: VueConstructor<Vue>) {
    // VueJs.use(Vuex);
    this.vm = new VueJs({
      el: ele,
      data(){
        return {
          topNodes: Nodes.topNodes,
          allNodes: Nodes.nodes,
          dropTargetId: Nodes.dropTargetId,
          hoverId: Nodes.hoverId
        }
      },
      mounted() {
        const Id0 = uuid.v4();
        Nodes.SET_NODES({
          [Id0]: {
            id: Id0,
            parentId: '',
            childrenId: [],
            attr: {
              style: {
                height: '100%',
                width: '100%'
              }
            },
            tag: 'div',
          }
        })
        // const Id0 = uuid.v4();
        // const Id1 = uuid.v4();
        // const Id2 = uuid.v4();
        // Nodes.SET_NODES({
        //   [Id0]: {
        //     id: Id0,
        //     parentId: '',
        //     childrenId: [Id1],
        //     attr: {},
        //     tag: 'div',
        //   },
        //   [Id1]: {
        //     id: Id1,
        //     parentId: Id0,
        //     childrenId: [Id2],
        //     attr: {class: ['layout']},
        //     tag: 'div',
        //   },
        //   [Id2]: {
        //     id: Id2,
        //     parentId: Id1,
        //     childrenId: ['init btn'],
        //     attr: {},
        //     tag: 'v-btn',
        //   },
        // });
        Emitter.$on('update:vuex', ({mutation, state})=>{
          this.topNodes = Nodes.topNodes,
          this.allNodes = Nodes.nodes
          this.dropTargetId = Nodes.dropTargetId
          this.hoverId = Nodes.hoverId
        })
      },
      render(h: CreateElement): VNode {
        return h('div', this.topNodes.map((n) => this.rRender(n.id)));
      },
      methods: {
        rRender(id: string): VNode {
          // tslint:disable
          // console.log('render', id);
          return Optional.ofNullable(clone(this.allNodes[id]))
                    .map((n) => {
                      // if( n.id === Nodes.hoverId) {
                      //   const attr = addListener({});
                      //   if(!attr.class) attr.class = []
                      //   attr.class.push("drag-enter")
                      //   this.$createElement("div", attr, [...n.childrenId.map((i: string) => this.rRender(id))] );
                      // }
                      const attr = addListener(n.attr);
                      if(!attr.domProps) attr.domProps = {}
                      attr.domProps.__VUE_WEB_BUILDER_ID__ = id
                      attr.domProps.draggable = true
                      if( n.id === this.dropTargetId) {
                        if(!attr.class) attr.class = []
                        attr.class.push("drag-enter")
                      }

                      if( n.id === this.hoverId) {
                        if(!attr.class) attr.class = []
                        attr.class.push("vue-web-builder-hover")
                      }

                      
                      const vnode = this.$createElement(n.tag, attr, n.childrenId.map((i: string) => this.rRender(i)) );
                      return vnode
                    })
                    .orElse(id);

        },
      },
    });
    // console.log(this.vm, VueJs)
    Nodes.SET_COMPONENTS(Object.keys(VueJs.options.components));
    // console.log(this.vm)
    // setInterval(()=>{
    //   console.log(this.vm.topNodes, Nodes.topNodes, this.vm.allNodes)
    //   this.vm.$forceUpdate()
    // },100)
    
  }
  public update(): void {
    this.vm.$forceUpdate();
  }
}

const addListener = (attr: VNodeData) => {
  if (!attr.on) { attr.on = {}; }
  attr.on.dragstart = ($event: DragEvent) => LocalVue.dragStart($event);
  attr.on.dragend = ($event: DragEvent) => LocalVue.dragEnd($event);
  attr.on.dragenter = ($event: DragEvent) => LocalVue.dragEnter($event);
  attr.on.drop = ($event: DragEvent) => LocalVue.drop($event);
  attr.on.dragover = ($event: DragEvent) => $event.preventDefault();
  attr.on.mouseenter = ($event: DragEvent) => LocalVue.mouseEnter($event);
  attr.on.mouseleave = ($event: DragEvent) => LocalVue.mouseLeave($event);

  // if (!attr.nativeOn) { attr.nativeOn = {}; }
  // attr.nativeOn.dragstart = ($event: DragEvent) => console.log("dragstart nativeOn")//LocalVue.dragStart($event);
  // attr.nativeOn.dragend = ($event: DragEvent) => LocalVue.dragEnd($event);
  // attr.nativeOn.dragenter = ($event: DragEvent) => LocalVue.dragEnter($event);
  // attr.nativeOn.drop = ($event: DragEvent) => LocalVue.drop($event);
  // attr.nativeOn.dragover = ($event: DragEvent) => $event.preventDefault();
  // attr.on.mouseenter = ($event: DragEvent) => LocalVue.mouseEnter($event);
  // attr.on.mouseleave = ($event: DragEvent) => LocalVue.mouseLeave($event);

  return attr
};
