import Vue, { VueConstructor } from "vue";
import { createRenderer } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/useNodeState/";
import { register } from "@/directives";
import VueRouter from "vue-router";

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
  VueRouter: typeof VueRouter;
};
export const useLocalVue = () => {
  const { node, hoverNodeId, dropNodeId } = useState();
  const { renderNode, nodeData } = createRenderer(
    node,
    hoverNodeId,
    dropNodeId
  );
  const init = (w: IframeWindow): Promise<string[]> => {
    return new Promise(resolve => {
      if (w.Vue === undefined) {
        setTimeout(async () => {
          const components = await init(w);
          resolve(components);
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
        resolve(components);
        w.dispatchEvent(new Event("createdVue"));
        console.log(router.currentRoute);
        router.afterEach((to, from) => {
          console.log(to, from);
        });
        setTimeout(() => {
          router.push({ path: "/hoge" });
          setTimeout(() => {
            router.push({ path: "/" });
          }, 3000);
        }, 3000);
      }
    });
  };
  return {
    init
  };
};
