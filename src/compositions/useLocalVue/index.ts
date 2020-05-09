import Vue, { VueConstructor } from "vue";
import { createRenderer } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/useNodeState/";
import { register } from "@/directives";
import VueRouter, { Route } from "vue-router";
import { nodeDao } from "@/infrastructure/nodes";

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
  router?: VueRouter;
};
export const useLocalVue = () => {
  const { nodeTree, hoverNodeId, dropNodeId, currentRoute } = useState(nodeDao);
  const { renderNode, nodeData } = createRenderer(
    nodeTree,
    hoverNodeId,
    dropNodeId
  );
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
        register(w.Vue);
        const { vm, components, router, addRoute } = createVue(
          "#main-wrapper",
          nodeData,
          renderNode,
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
