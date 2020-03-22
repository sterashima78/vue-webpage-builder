import "@/plugins/";
import clone from "lodash.clonedeep";
import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node } from "@/types";
import { make, tree } from "fp-ts/lib/Tree";
import { pipe } from "fp-ts/lib/pipeable";
import { Option, some, none, isNone } from "fp-ts/lib/Option";
const list = ["default", "primary", "success", "info", "warning", "danger"];
const node: Ref<NodeTree> = ref(
  make<Node>(
    {
      id: "root",
      tag: "div",
      style: {
        height: "100%"
      }
    },
    [
      make<Node>({
        id: "link",
        tag: "router-link",
        text: "to hoge",
        attributes: {
          to: "/hoge"
        }
      }),
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

type NodeTreeMapper = (node: NodeTree) => NodeTree;
const findNodeById = (id: string) => (tree: NodeTree): Option<NodeTree> =>
  tree.value.id === id
    ? some(clone(tree))
    : tree.forest.reduce(
        (before: Option<NodeTree>, current) =>
          isNone(before) ? findNodeById(id)(current) : before,
        none
      );
const _editNode = (id: string, modifier: (node: NodeTree) => NodeTree) => (
  node: NodeTree
): NodeTree => {
  return node.value.id === id
    ? modifier(clone(node))
    : {
        value: clone(node.value),
        forest: node.forest.map(_editNode(id, modifier))
      };
};
const _removeNodeById = (id: string) => (treeState: NodeTree): NodeTree => ({
  value: clone(treeState.value),
  forest: treeState.forest
    .filter(i => i.value.id !== id)
    .map(_removeNodeById(id))
});
const _addNodeTo = (id: string, target: NodeTree) => (
  treeState: NodeTree
): NodeTree =>
  treeState.value.id === id
    ? {
        value: clone(treeState.value),
        forest: [...clone(treeState.forest), clone(target)]
      }
    : {
        value: clone(treeState.value),
        forest: treeState.forest.map(_addNodeTo(id, target))
      };

const _moveNodeTo = (to: string, target: string) => (node: NodeTree) => {
  const targetNode = findNodeById(target)(node);
  if (isNone(targetNode)) {
    return node;
  }
  const nodeRemoved = _removeNodeById(target)(node);
  const toNode = findNodeById(to)(nodeRemoved);
  if (isNone(toNode)) {
    return node;
  }
  return _addNodeTo(to, targetNode.value)(nodeRemoved);
};

interface TreeView {
  id: string;
  name: string;
  children: TreeView[];
}
const toTree = (node: NodeTree): TreeView => {
  return {
    id: node.value.id,
    name: node.value.tag,
    children: node.forest.map(toTree)
  };
};
const updateNode = (nodeValue: NodeTree) => (node.value = nodeValue);

const effectNode = (effect: NodeTreeMapper) =>
  pipe(node.value, effect, updateNode);

const dragNodeId = ref("");
const hoverNodeId = ref("");
const dropNodeId = ref("");
const dragTag = ref("");

export const useState = () => {
  /**
   * ノードをツリーに追加する
   * @param id 追加先ノードのID
   * @param target 追加するノード
   */
  const addNodeTo = (id: string, target: NodeTree) =>
    effectNode(_addNodeTo(id, target));
  /**
   * ノードをツリーから削除する
   * @param id 削除するノード
   */
  const removeNodeById = (id: string) => effectNode(_removeNodeById(id));

  /**
   * ノードを別ノードの子ノードへ追加する
   * @param to 移動先ノードのID
   * @param target 移動するノードのID
   */
  const moveNodeTo = (to: string, target: string) =>
    effectNode(_moveNodeTo(to, target));
  /**
   * ノードを変更する
   * @param id 変更対象ノードのID
   * @param modifier 変更処理
   */
  const editNode = (id: string, modifier: NodeTreeMapper) =>
    effectNode(_editNode(id, modifier));

  /**
   * ノードツリーからIDに相当するノードを検索する
   * @param id 検索対象ID
   */
  const findById = (id: string) => pipe(node.value, findNodeById(id));

  const treeNode = computed(() => toTree(node.value));

  return {
    node,
    treeNode,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    findById,
    editNode,
    dragNodeId,
    hoverNodeId,
    dropNodeId,
    dragTag
  };
};
