import Vue, { VueConstructor } from "vue";
import { createRenderer } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/useNodeState/";
import { register } from "@/directives";
import VueRouter, { Route } from "vue-router";
import { ref } from "@vue/composition-api";

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
};
export const useLocalVue = () => {
  const { nodeTree, hoverNodeId, dropNodeId } = useState();
  const { renderNode, nodeData } = createRenderer(
    nodeTree,
    hoverNodeId,
    dropNodeId
  );
  const currentRoute = ref("/");
  const init = (
    w: IframeWindow
  ): Promise<{ components: string[]; routing: VueRouter["push"] }> => {
    return new Promise(resolve => {
      if (w.Vue === undefined) {
        setTimeout(async () => {
          const ret = await init(w);
          resolve(ret);
        }, 100);
      } else {
        register(w.Vue);
        const { vm, components, router } = createVue(
          "#main-wrapper",
          nodeData,
          renderNode,
          w.Vue,
          w.VueRouter,
          w.VueOption
        );
        w.vm = vm;
        resolve({ components, routing: router.push });
        w.dispatchEvent(new Event("createdVue"));
        router.afterEach((to: Route) => {
          currentRoute.value = to.fullPath;
        });
      }
    });
  };
  return {
    init,
    currentRoute
  };
};
