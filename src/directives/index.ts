import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";
import { nodeDao } from "@/infrastructure/nodes";

export const register = (Vue: VueConstructor) => {
  const { dragNodeId, hoverNodeId, dropNodeId, dropElement } = useState(
    nodeDao
  );
  registerDirective(hoverNodeId, dragNodeId, dropNodeId, dropElement, Vue);
};
