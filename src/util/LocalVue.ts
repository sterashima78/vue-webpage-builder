import Vue, {CreateElement, VNode, VNodeData } from "vue"
import Vuetify from 'vuetify';
Vue.use(Vuetify);
import cloneDeep from "lodash.clonedeep"
import Optional from "typescript-optional";

interface VueNode {
  id: number
  tag: string;
  attr: VNodeData;
  // children: Array<VueNode>;
  childrenId: Array<string>;
  parentId: string;
}

export default class LocalVue {
  vm: Vue;


  setNodes(nodes: any) {
    this.vm.$data.nodes = nodes
    this.vm.$forceUpdate()  
    console.log("update", this.vm.$data.nodes)
  }
  constructor(ele: Element){
    this.vm = new Vue({ 
      el: ele,
      data: {
        nodes: new Map<string, VueNode>([
          [0, {tag: "v-app", attr: {}, childrenId: [], parentId: `__VUE_WEB_BUILDER_-1__`}],
        ])
      },
      render(h: CreateElement): VNode{
        console.log("======= start render ==========")
        return this.rRender(`__VUE_WEB_BUILDER_0__`);
      },
      methods: {
        rRender(id: string): VNode{
          console.log(id, this.nodes.get(id))
          return Optional.ofNullable(this.nodes.get(id))
                        .map(n => this.$createElement(n.tag, n.attr, n.childrenId.map(i => this.rRender(i)) ))
                        .orElse(id)
        }
      }
    })
  }
}