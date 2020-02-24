import "@/plugin/";
import clone from "lodash.clonedeep";
import { ref, Ref } from "@vue/composition-api";
import { NodeTree, Node, NodeData } from "@/types";
import { make, tree, duplicate, flatten, reduce } from "fp-ts/lib/Tree";
import { pipe } from "fp-ts/lib/pipeable";
const list = ["default", "primary", "success", "info", "warning", "danger"];
const node: Ref<NodeTree> = ref(
  make<Node>(
    {
      id: "root",
      tag: "div"
    },
    [
      make<Node>(
        {
          id: "c1",
          tag: "el-row"
        },
        list.map(type =>
          tree.of({
            id: `c1-${type}`,
            tag: "el-button",
            text: type,
            attributes: { type }
          })
        )
      ),
      make<Node>(
        {
          id: "c2",
          tag: "el-row"
        },
        list.map(type =>
          tree.of<Node>({
            id: `c2-${type}-round`,
            tag: "el-button",
            text: type,
            attributes: { type, round: true }
          })
        )
      ),
      make<Node>(
        {
          id: "c3",
          tag: "el-row"
        },
        list.map(type =>
          tree.of<Node>({
            id: `c3-${type}-plain`,
            tag: "el-button",
            text: type,
            attributes: { type, plain: true }
          })
        )
      )
    ]
  )
);
setInterval(() => {
  const v = clone(node.value);
  v.forest.push(
    tree.of({ id: Math.random().toString(32), tag: "span", text: "append" })
  );
  node.value = v;
  console.log(v, node.value);
}, 3000);
export const useState = () => {
  return { node };
};

export const toNodeData = (tree: NodeTree): NodeData => {
  const { tag, text, id, attributes } = tree.value;
  const texts = text ? [text] : [];
  return {
    tag,
    data: {
      attrs: {
        id
      },
      props: attributes
    },
    children: [...tree.forest.map(toNodeData), ...texts]
  };
};
