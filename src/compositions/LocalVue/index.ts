import "@/plugin/";
import { ref, watch, Ref } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { CreateElement, VNode } from "vue/types/umd";
import { NodeData } from "@/types";
import clone from "lodash.clonedeep";
import { rederNode } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/store/";
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
  const init = (
    w: Window & { Vue?: VueConstructor<Vue>; vm: Vue; VueOption: any }
  ) => {
    if (w.Vue === undefined) {
      return setTimeout(init, 100);
    }
    w.vm = createVue(components, nodeDataTree, w.Vue, w.VueOption);
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
    editNode,
    node
  };
};
