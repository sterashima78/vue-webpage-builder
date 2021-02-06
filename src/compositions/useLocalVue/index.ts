import Vue, { VueConstructor } from "vue";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/useNodeState/";
import { register } from "@/directives";
import VueRouter, { Route } from "vue-router";
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
  watch(() => node.value, sendMsg);
  watch(() => hoverNodeId.value, sendMsg);
  watch(() => dropNodeId.value, sendMsg);
  return {
    nodeData
  };
};

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
  router?: VueRouter;
};
export const useLocalVue = (nodeDao: NodeDao, aliasDao: AliasDao) => {
  const { nodeTree, hoverNodeId, dropNodeId, currentRoute } = useState(
    nodeDao,
    aliasDao
  );
  const { nodeData } = convertData(nodeTree, hoverNodeId, dropNodeId);
  const init = (
    w: IframeWindow
  ): Promise<{
    components: string[];
    router: VueRouter;
    addRoute: (path: string) => void;
  }> => {
    return new Promise(resolve => {
      if (w.Vue === undefined) {
        setTimeout(async () => {
          const ret = await init(w);
          resolve(ret);
        }, 100);
      } else {
        register(w.Vue, nodeDao, aliasDao);
        const { vm, components, router, addRoute } = createVue(
          "#main-wrapper",
          nodeData,
          w.Vue,
          w.VueRouter,
          w.VueOption
        );
        w.vm = vm;
        w.router = router;
        resolve({ components, router, addRoute });
        w.dispatchEvent(new Event("createdVue"));
        router.afterEach((to: Route) => {
          currentRoute.value = to.path;
        });
      }
    });
  };
  return {
    init,
    currentRoute
  };
};
