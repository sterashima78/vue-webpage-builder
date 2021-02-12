import { NodeData } from "@/types";
import { EleNode, NodeTree } from "@sterashima/vue-component-sandbox";

export type NodeDataToNodeTree = (node: NodeData) => NodeTree;
export const toNodeTree: NodeDataToNodeTree = node => {
  const value: EleNode = {
    id: node.data.attrs?.id || "",
    tag: node.tag
  };
  const { id: _, ...attrs } = {
    id: "",
    ...node.data.attrs,
    ...node.data.props
  };
  if (typeof node.data.style === "object" && !Array.isArray(node.data.style))
    value.style = node.data.style as { string: string };
  if (Array.isArray(node.data.class)) value.classes = node.data.class;
  if (Object.keys(attrs).length !== 0) value.attributes = attrs as any;
  if (node.data.slot) value.slot = node.data.slot;
  if (node.data.domProps) value.domProps = node.data.domProps;
  if (node.data.on) {
    value.on = {};
    for (const key in node.data.on) {
      if (typeof node.data.on[key] === "function") {
        value.on[key] = node.data.on[key] as (d: any) => void;
      }
    }
  }
  return {
    value,
    children: node.children.map(i =>
      typeof i === "string" ? i : toNodeTree(i)
    )
  };
};
