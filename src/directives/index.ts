import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";
import { NodeDao } from "@/domain/nodes";
import { AliasDao } from "@/domain/alias";

export const register = (
  Vue: VueConstructor,
  nodeDao: NodeDao,
  aliasDao: AliasDao
) => {
  const { dragNodeId, hoverNodeId, dropNodeId, dropElement } = useState(
    nodeDao,
    aliasDao
  );
  registerDirective(hoverNodeId, dragNodeId, dropNodeId, dropElement, Vue);
};
