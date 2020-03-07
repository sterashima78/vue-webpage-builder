import "@/plugin/";
import { ref, watch, Ref } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { CreateElement, VNode } from "vue/types/umd";
import { NodeData } from "@/types";
import clone from "lodash.clonedeep";

import { useState } from "./store/";
export const useLocalVue = (dragTag: Ref<string>) => {
  const ids: string[] = [];
  const dropTargetId = ref("");
  const {
    node,
    treeNode,
    dragNodeId,
    dropNodeId,
    hoverNodeId,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    nodeDataTree,
    findById,
    editNode
  } = useState(dragTag);
  const components = ref<string[]>([]);
  const rederNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode => {
    return h(
      tag,
      {
        ...data
      },
      children.map(i => (typeof i === "string" ? i : rederNode(h, i)))
    );
  };
  const init = (
    w: Window & { Vue?: VueConstructor<Vue>; vm: Vue; VueOption: any }
  ) => {
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
    const store = w.Vue.observable({ node: clone(nodeDataTree.value) });
    watch(nodeDataTree, v => {
      store.node = clone(v);
    });
    const CustomVue = w.VueOption ? w.Vue.extend(w.VueOption) : w.Vue;
    w.vm = new CustomVue({
      el: "#main-wrapper",
      render(h) {
        return rederNode(h, store.node);
      }
    });
    w.dispatchEvent(new Event("createdVue"));
  };
  return {
    init,
    components,
    treeNode,
    hoverNodeId,
    dragNodeId,
    dropNodeId,
    addNodeTo,
    moveNodeTo,
    removeNodeById,
    findById,
    editNode
  };
};
