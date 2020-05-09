import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";
import { nodeDao } from "@/infrastructure/nodes";
import { aliasDao } from "@/infrastructure/alias";

export const register = (Vue: VueConstructor) => {
  const { dragNodeId, hoverNodeId, dropNodeId, dropElement } = useState(
    nodeDao,
    aliasDao
  );
  registerDirective(hoverNodeId, dragNodeId, dropNodeId, dropElement, Vue);
};
