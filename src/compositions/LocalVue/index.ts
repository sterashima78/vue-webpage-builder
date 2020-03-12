import "@/plugin/";
import { ref, watch, Ref } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { CreateElement, VNode } from "vue/types/umd";
import { NodeData } from "@/types";
import clone from "lodash.clonedeep";
import { createRenderer } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/store/";
type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
};
export const useLocalVue = () => {
  const ids: string[] = [];
  const dragNodeId = ref("");
  const hoverNodeId = ref("");
  const dropNodeId = ref("");
  const dragTag = ref("");
  const dropTargetId = ref("");
  const {
    node,
    treeNode,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    findById,
    editNode
  } = useState();
  const { renderNode, nodeData, eventHandler } = createRenderer(
    node,
    dragNodeId,
    hoverNodeId,
    dropNodeId,
    dragTag
  );
  const components = ref<string[]>([]);
  const init = (w: IframeWindow) => {
    if (w.Vue === undefined) {
      return setTimeout(() => init(w), 100);
    }
    w.vm = createVue(components, nodeData, renderNode, w.Vue, w.VueOption);
    w.dispatchEvent(new Event("createdVue"));
  };
  return {
    init,
    components,
    dragTag,
    eventHandler
  };
};
