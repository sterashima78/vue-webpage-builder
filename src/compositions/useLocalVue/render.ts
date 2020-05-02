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
    const { tag, text, id, attributes, style, classes } = clone(tree.value);
    const texts = text ? [text] : [];
    const styles = style || {};
    const scopedSlotsData = tree.forest.reduce((data, tree) => {
      if (!tree.value.slot || tree.value.slot === "default") return data;
      if (!data[tree.value.slot]) {
        data[tree.value.slot] = [toNodeData(tree)];
      } else {
        data[tree.value.slot].push(toNodeData(tree));
      }
      return data;
    }, {} as { [slot: string]: NodeData[] });
    const children = tree.forest.filter(
      child => !child.value.slot || child.value.slot === "default"
    );

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
        class: classes
      },
      children: [...children.map(toNodeData), ...texts],
      scopedSlotsData
    };
  };
  const renderNode = (
    h: CreateElement,
    { tag, data, children, scopedSlotsData }: NodeData
  ): VNode =>
    h(
      tag,
      {
        ...data,
        scopedSlots: Object.entries(scopedSlotsData).reduce(
          (
            slots,
            [key, data]
          ): NonNullable<NodeData["data"]["scopedSlots"]> => ({
            ...slots,
            [key]: () => data.map(i => renderNode(h, i))
          }),
          {} as NonNullable<NodeData["data"]["scopedSlots"]>
        )
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
