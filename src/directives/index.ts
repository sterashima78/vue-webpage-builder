import { VueConstructor } from "vue";
import { registerDirective } from "./web-builder";
import { useState } from "@/compositions/useNodeState";
import { NodeDao } from "@/domain/nodes";
import { AliasDao } from "@/domain/alias";

export const register = (nodeDao: NodeDao, aliasDao: AliasDao) => (
  Vue: VueConstructor
) => {
  const { dragNodeId, hoverNodeId, dropNodeId, dropElement } = useState(
    nodeDao,
    aliasDao
  );
  registerDirective(hoverNodeId, dragNodeId, dropNodeId, dropElement, Vue);
};
