import Vue, {CreateElement, VNode, VNodeData } from 'vue';
import Vuetify from 'vuetify';
Vue.use(Vuetify);
import Optional from 'typescript-optional';

export interface VueNode {
  id: number;
  tag: string;
  attr: VNodeData;
  childrenId: string[];
  parentId: string;
}

export default class LocalVue {
  public vm: Vue;
  constructor(ele: Element) {
    this.vm = new Vue({
      el: ele,
      data: {
        nodes: new Map<string, VueNode>([
          ['__VUE_WEB_BUILDER_0__', {id: 0, tag: 'v-app', attr: {}, childrenId: [], parentId: `__VUE_WEB_BUILDER_-1__`}],
        ]),
      },
      render(h: CreateElement): VNode {
        return this.rRender(`__VUE_WEB_BUILDER_0__`);
      },
      methods: {
        rRender(id: string): VNode {
          return Optional.ofNullable(this.nodes.get(id))
                        .map((n) => this.$createElement(n.tag, n.attr, n.childrenId.map((i) => this.rRender(i)) ))
                        .orElse(id);
        },
      },
    });
  }


  public setNodes(nodes: any) {
    this.vm.$data.nodes = nodes;
    this.vm.$forceUpdate();
    console.log('update', this.vm.$data.nodes);
  }
}
