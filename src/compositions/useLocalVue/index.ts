import Vue, { VueConstructor } from "vue";
import { createVue } from "./createInstance";
import { register } from "@/directives";
import VueRouter from "vue-router";
import { NodeDao } from "@/domain/nodes";
import { AliasDao } from "@/domain/alias";

import { Ref, computed, ref, watch } from "@vue/composition-api";
import { RouteNodeTree, RouteNodeTreeData } from "@/types";
import Worker from "worker-loader!./createNodeData.worker";
import throttle from "lodash.throttle";
export const convertData = (
  node: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>
) => {
  const _nodeData = ref<RouteNodeTreeData>({});
  const nodeData = computed(() => _nodeData.value);
  const worker = new Worker();
  worker.onmessage = (event: any) => {
    _nodeData.value = event.data;
  };
  const sendMsg = throttle(
    () =>
      worker.postMessage({
        hoverNodeId: hoverNodeId.value,
        dropNodeId: dropNodeId.value,
        node: node.value
      }),
    16
  );
  watch(node, sendMsg, {
    immediate: true
  });
  watch(hoverNodeId, sendMsg, {
    immediate: true
  });
  watch(dropNodeId, sendMsg, {
    immediate: true
  });
  return nodeData;
};

const init = (
  nodeDao: NodeDao,
  aliasDao: AliasDao,
  currentRoute: Ref<string>,
  nodeData: Ref<RouteNodeTreeData>
) => (
  Vue: VueConstructor<Vue>,
  Router: typeof VueRouter,
  VueOption: any,
  setVM: (vm: Vue) => void,
  dispatch: () => void
): void => {
  register(Vue, nodeDao, aliasDao);
  const { vm } = createVue(
    "#main-wrapper",
    nodeData,
    Vue,
    Router,
    VueOption,
    currentRoute
  );
  setVM(vm);
  dispatch();
};
export const useLocalVue = (
  nodeDao: NodeDao,
  aliasDao: AliasDao,
  nodeTree: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  currentRoute: Ref<string>
) => ({
  init: init(
    nodeDao,
    aliasDao,
    currentRoute,
    convertData(nodeTree, hoverNodeId, dropNodeId)
  )
});
