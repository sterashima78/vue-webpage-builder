import "@/plugin/";
import { ref, watch } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { CreateElement, VNode } from "vue/types/umd";
import { NodeData } from "@/types";
import { useState, toNodeData } from "./store/";
export const useLocalVue = () => {
  const { node } = useState();
  const components = ref<string[]>([]);
  const rederNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode => {
    return h(
      tag,
      data,
      children.map(i => (typeof i === "string" ? i : rederNode(h, i)))
    );
  };
  const init = (w: Window & { Vue?: VueConstructor<Vue> }) => {
    if (w.Vue === undefined) {
      return setTimeout(init, 100);
    }
    components.value = pipe(
      fromNullable(w.Vue as any),
      map(i => i.options),
      map(i => i.components),
      map(i => Object.keys(i)),
      getOrElse(() => [] as string[])
    );
    const store = w.Vue.observable({ node: node.value });
    watch(node, v => (store.node = v));
    const vm = new w.Vue({
      el: "#main-wrapper",
      render(h) {
        return rederNode(h, toNodeData(store.node));
      }
    });
  };
  return { init, components };
};
