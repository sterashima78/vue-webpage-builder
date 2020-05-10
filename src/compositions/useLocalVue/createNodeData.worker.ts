import { NodeTree, NodeData, RouteNodeTreeData, RouteNodeTree } from "@/types";
import clone from "lodash.clonedeep";
const toNodeData = (hoverNodeId: string, dropNodeId: string) => (
  tree: NodeTree
): NodeData => {
  const { tag, text, id, attributes, style, classes, slot } = clone(tree.value);
  const texts = text ? [text] : [];
  const styles = style || {};
  const children = tree.forest;
  if (hoverNodeId === id || dropNodeId === id) {
    styles["box-sizing"] = "border-box";
  }
  if (hoverNodeId === id) styles.border = "solid red 2px";
  if (dropNodeId === id) styles.border = "solid blue 2px";
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
    children: [...children.map(toNodeData(hoverNodeId, dropNodeId)), ...texts]
  };
};

const ctx: Worker = self as any;
type MsgData = {
  node: RouteNodeTree;
  hoverNodeId: string;
  dropNodeId: string;
};
ctx.addEventListener("message", (event: { data: MsgData }) => {
  const convert = toNodeData(event.data.hoverNodeId, event.data.dropNodeId);
  const data = Object.entries(event.data.node).reduce((data, [key, n]) => {
    data[key] = convert(n);
    return data;
  }, {} as RouteNodeTreeData);
  ctx.postMessage(data);
});
