import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";

export const register = (Vue: VueConstructor) => {
  const { dragNodeId, hoverNodeId, dropNodeId, dropElement } = useState();
  registerDirective(hoverNodeId, dragNodeId, dropNodeId, dropElement, Vue);
};
