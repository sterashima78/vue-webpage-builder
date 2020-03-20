import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/store";

export const register = (Vue: VueConstructor) => {
  const {
    dragNodeId,
    hoverNodeId,
    dragTag,
    dropTargetId,
    addNodeTo,
    moveNodeTo
  } = useState();
  registerDirective(
    hoverNodeId,
    dragNodeId,
    dragTag,
    dropTargetId,
    addNodeTo,
    moveNodeTo,
    Vue
  );
};
