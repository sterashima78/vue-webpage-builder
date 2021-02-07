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

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
  router?: VueRouter;
};

const init = (
  nodeDao: NodeDao,
  aliasDao: AliasDao,
  currentRoute: Ref<string>,
  nodeData: Ref<RouteNodeTreeData>
) => {
  const _init = (
    w: IframeWindow
  ): Promise<{
    components: string[];
  }> => {
    return new Promise(resolve => {
      if (w.Vue === undefined) {
        setTimeout(async () => {
          const ret = await _init(w);
          resolve(ret);
        }, 100);
      } else {
        register(w.Vue, nodeDao, aliasDao);
        const { vm, components } = createVue(
          "#main-wrapper",
          nodeData,
          w.Vue,
          w.VueRouter,
          w.VueOption,
          currentRoute
        );
        w.vm = vm;
        resolve({ components });
        w.dispatchEvent(new Event("createdVue"));
      }
    });
  };
  return _init;
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
