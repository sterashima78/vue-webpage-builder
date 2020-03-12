import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, NodeData } from "@/types";
import clone from "lodash.clonedeep";
import { createEvents } from "./eventHandler";
import { CreateElement, VNode } from "vue";
import { useState } from "@/compositions/store/";

export const createRenderer = (
  node: Ref<NodeTree>,
  hoverNodeId: Ref<string>,
  dragNodeId: Ref<string>,
  dragTag: Ref<string>,
  dropNodeId: Ref<string>
) => {
  const { addNodeTo, moveNodeTo } = useState(dragTag);
  const eventHandler = createEvents(
    hoverNodeId,
    dragNodeId,
    dragTag,
    dropNodeId,
    addNodeTo,
    moveNodeTo
  );
  const toNodeData = (tree: NodeTree): NodeData => {
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
          ...eventHandler
        },
        props: attributes,
        style: styles,
        class: classes
      },
      children: [...tree.forest.map(toNodeData), ...texts]
    };
  };
  const renderNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode => {
    return h(
      tag,
      {
        ...data
      },
      children.map(i => (typeof i === "string" ? i : renderNode(h, i)))
    );
  };
  const nodeData = computed(() => toNodeData(node.value));
  return {
    renderNode,
    nodeData,
    eventHandler
  };
};
