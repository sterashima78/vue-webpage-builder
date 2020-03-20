import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";

export const register = (Vue: VueConstructor) => {
  const {
    dragNodeId,
    hoverNodeId,
    dragTag,
    dropNodeId,
    addNodeTo,
    moveNodeTo
  } = useState();
  registerDirective(
    hoverNodeId,
    dragNodeId,
    dragTag,
    dropNodeId,
    addNodeTo,
    moveNodeTo,
    Vue
  );
};
