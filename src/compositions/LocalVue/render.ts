import { Ref, computed } from "@vue/composition-api";
import { NodeTree, NodeData } from "@/types";
import clone from "lodash.clonedeep";
import { CreateElement, VNode } from "vue";

export const createRenderer = (
  node: Ref<NodeTree>,
  hoverNodeId: Ref<string>,
  dragNodeId: Ref<string>,
  dragTag: Ref<string>,
  dropNodeId: Ref<string>
) => {
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
        directives: [
          {
            name: "web-builder"
          }
        ],
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
    nodeData
  };
};
