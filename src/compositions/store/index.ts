import "@/plugin/";
import clone from "lodash.clonedeep";
import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, NodeData } from "@/types";
import { make, tree, duplicate, flatten, reduce, chain } from "fp-ts/lib/Tree";
import { pipe } from "fp-ts/lib/pipeable";
import { Option, some, none, isNone, fold } from "fp-ts/lib/Option";
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

const findNodeById = (id: string) => (tree: NodeTree): Option<NodeTree> =>
  tree.value.id === id
    ? some(clone(tree))
    : tree.forest.reduce(
        (before: Option<NodeTree>, current) =>
          isNone(before) ? findNodeById(id)(current) : before,
        none
      );

const _removeNodeById = (id: string) => (treeState: NodeTree): NodeTree => ({
  value: clone(treeState.value),
  forest: treeState.forest
    .filter(i => i.value.id !== id)
    .map(_removeNodeById(id))
});
const _addNodeTo = (id: string, target: Node) => (
  treeState: NodeTree
): NodeTree =>
  treeState.value.id === id
    ? {
        value: clone(treeState.value),
        forest: [...clone(treeState.forest), tree.of<Node>(target)]
      }
    : {
        value: clone(treeState.value),
        forest: treeState.forest.map(_addNodeTo(id, target))
      };

const _moveNodeTo = (node: NodeTree) => (to: string, target: string) => {
  const targetNode = findNodeById(target)(node);
  if (isNone(targetNode)) {
    console.log("target is none");
    return node;
  }
  const nodeRemoved = _removeNodeById(target)(node);
  const toNode = findNodeById(to)(nodeRemoved);
  if (isNone(toNode)) {
    console.log("to is none");
    return node;
  }
  return _addNodeTo(to, targetNode.value.value)(nodeRemoved);
};

export const useState = () => {
  /**
   * ノードをツリーに追加する
   * @param id 追加先ノードのID
   * @param target 追加するノード
   */
  const addNodeTo = (id: string, target: Node) =>
    (node.value = _addNodeTo(id, target)(node.value));
  /**
   * ノードをツリーから削除する
   * @param id 削除するノード
   */
  const removeNodeById = (id: string) =>
    (node.value = _removeNodeById(id)(node.value));
  /**
   * ノードを別ノードの子ノードへ追加する
   * @param to 移動先ノードのID
   * @param target 移動するノードのID
   */
  const moveNodeTo = (to: string, target: string) =>
    (node.value = _moveNodeTo(node.value)(to, target));
  return { node, addNodeTo, removeNodeById, moveNodeTo };
};

export const toNodeData = (tree: NodeTree): NodeData => {
  const { tag, text, id, attributes, style, classes } = tree.value;
  const texts = text ? [text] : [];
  return {
    tag,
    data: {
      attrs: {
        id
      },
      props: attributes,
      style,
      class: classes
    },
    children: [...tree.forest.map(toNodeData), ...texts]
  };
};
