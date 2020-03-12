import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, NodeData } from "@/types";
import clone from "lodash.clonedeep";
import { createEvents } from "./eventHandler";
import { CreateElement, VNode } from "vue";
const toNodeData = (
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  dragNodeId: Ref<string>,
  dragTag: Ref<string>,
  addNodeTo: (to: string, node: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void
) => (tree: NodeTree): NodeData => {
  const { tag, text, id, attributes, style, classes } = clone(tree.value);
  const texts = text ? [text] : [];
  const styles = style || {};
  if (hoverNodeId.value === id) styles.border = "solid red 5px";
  if (dropNodeId.value === id) styles.border = "solid blue 5px";
  return {
    tag,
    data: {
      attrs: {
        id,
        draggable: true
      },
      on: {
        ...createEvents(
          hoverNodeId,
          dragNodeId,
          dragTag,
          dropNodeId,
          addNodeTo,
          moveNodeTo
        )
      },
      props: attributes,
      style: styles,
      class: classes
    },
    children: [
      ...tree.forest.map(
        toNodeData(
          hoverNodeId,
          dropNodeId,
          dragNodeId,
          dragTag,
          addNodeTo,
          moveNodeTo
        )
      ),
      ...texts
    ]
  };
};

export const rederNode = (
  h: CreateElement,
  { tag, data, children }: NodeData
): VNode => {
  return h(
    tag,
    {
      ...data
    },
    children.map(i => (typeof i === "string" ? i : rederNode(h, i)))
  );
};
