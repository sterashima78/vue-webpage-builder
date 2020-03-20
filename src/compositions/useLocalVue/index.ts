import Vue, { VueConstructor } from "vue";
import { createRenderer } from "./render";
import { createVue } from "./createInstance";
import { useState } from "@/compositions/useNodeState/";
import { register } from "@/directives";

export type IframeWindow = Window & {
  Vue?: VueConstructor<Vue>;
  vm: Vue;
  VueOption: any;
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
        const { vm, components } = createVue(
          nodeData,
          renderNode,
          w.Vue,
          w.VueOption
        );
        w.vm = vm;
        resolve(components);
        w.dispatchEvent(new Event("createdVue"));
      }
    });
  };
  return {
    init
  };
};
