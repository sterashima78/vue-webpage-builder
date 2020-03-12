import { Ref, watch } from "@vue/composition-api";
import { NodeData, NodeTree } from "@/types";
import { pipe } from "fp-ts/es6/pipeable";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import clone from "lodash.clonedeep";
import Vue, { VueConstructor, VNode, CreateElement } from "vue";
export const createVue = (
  components: Ref<string[]>,
  nodeData: Ref<NodeData>,
  renderNode: (h: CreateElement, node: NodeData) => VNode,
  Vue: VueConstructor<Vue>,
  VueOption: any | undefined
) => {
  components.value = pipe(
    fromNullable(Vue as any),
    map(i => i.options),
    map(i => i.components),
    map(i => Object.keys(i)),
    getOrElse(() => [] as string[])
  );
  const store = Vue.observable({ node: clone(nodeData.value) });
  watch(nodeData, v => (store.node = clone(v)));
  const CustomVue = VueOption ? Vue.extend(VueOption) : Vue;
  return new CustomVue({
    el: "#main-wrapper",
    render(h) {
      return renderNode(h, store.node);
    }
  });
};
