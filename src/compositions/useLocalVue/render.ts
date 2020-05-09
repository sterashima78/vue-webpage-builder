import { Ref, computed } from "@vue/composition-api";
import { NodeTree, NodeData, RouteNodeTree, RouteNodeTreeData } from "@/types";
import clone from "lodash.clonedeep";
import { CreateElement, VNode } from "vue";

export const createRenderer = (
  node: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>
) => {
  const toNodeData = (tree: NodeTree): NodeData => {
    const { tag, text, id, attributes, style, classes, slot } = clone(
      tree.value
    );
    const texts = text ? [text] : [];
    const styles = style || {};
    const children = tree.forest;
    if (hoverNodeId.value === id || dropNodeId.value === id) {
      styles["box-sizing"] = "border-box";
    }
    if (hoverNodeId.value === id) styles.border = "solid red 2px";
    if (dropNodeId.value === id) styles.border = "solid blue 2px";
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
        class: classes,
        slot
      },
      children: [...children.map(toNodeData), ...texts]
    };
  };
  const renderNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode =>
    h(
      tag,
      {
        ...data
      },
      children.map(i => (typeof i === "string" ? i : renderNode(h, i)))
    );

  const nodeData = computed(() =>
    Object.keys(node.value).reduce((data, key) => {
      data[key] = toNodeData(node.value[key]);
      return data;
    }, {} as RouteNodeTreeData)
  );
  return {
    renderNode,
    nodeData
  };
};
