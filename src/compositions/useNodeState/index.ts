import "@/plugins/";
import clone from "lodash.clonedeep";
import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, RouteNodeTree } from "@/types";
import { make, tree } from "fp-ts/lib/Tree";
import { pipe } from "fp-ts/lib/pipeable";
import {
  Option,
  some,
  none,
  isNone,
  map,
  fold,
  getOrElse
} from "fp-ts/lib/Option";
import { cloneNode } from "@/domain/nodes";
const list = ["default", "primary", "success", "info", "warning", "danger"];
const nodeTree: Ref<RouteNodeTree> = ref<RouteNodeTree>({
  "/": make<Node>(
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
        text: "to some path",
        attributes: {
          to: "/some-path"
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
  ),
  "/some-path": make<Node>(
    {
      id: "root",
      tag: "div",
      style: {
        height: "100%"
      }
    },
    [
      make<Node>({
        id: "link2",
        name: "Home Link",
        tag: "router-link",
        text: "to home",
        attributes: {
          to: "/"
        }
      }),
      make<Node>(
        {
          id: "dropdown",
          name: "Drop Down",
          tag: "el-dropdown"
        },
        [
          make<Node>(
            {
              id: `dropdown-link`,
              tag: "span",
              classes: ["el-dropdown-link"]
            },
            [
              tree.of<Node>({
                id: "list",
                tag: "span",
                text: "Dropdown List"
              }),
              tree.of<Node>({
                id: "icon",
                tag: "i",
                classes: ["el-icon-arrow-down", "el-icon--right"]
              })
            ]
          ),
          make<Node>(
            {
              id: `dropdown-menu`,
              tag: "el-dropdown-menu",
              slot: "dropdown",
              classes: ["el-dropdown-link"]
            },
            [
              tree.of<Node>({
                id: "menu-item-1",
                tag: "el-dropdown-item",
                text: "Action 1"
              }),
              tree.of<Node>({
                id: "menu-item-2",
                tag: "el-dropdown-item",
                text: "Action 2"
              }),
              tree.of<Node>({
                id: "menu-item-3",
                tag: "el-dropdown-item",
                text: "Action 3"
              }),
              tree.of<Node>({
                id: "menu-item-4",
                tag: "el-dropdown-item",
                text: "Action 4",
                attributes: {
                  disabled: true
                }
              }),
              tree.of<Node>({
                id: "menu-item-5",
                tag: "el-dropdown-item",
                text: "Action 5",
                attributes: {
                  divided: true
                }
              })
            ]
          )
        ]
      )
    ]
  )
});
/**
 * 全ルート
 */
const allRoute = computed(() => Object.keys(nodeTree.value));

/**
 * 現在のルート
 */
const currentRoute = ref<string>("/");

/**
 * 現在のルートのノードツリー
 */
const node = computed(() => nodeTree.value[currentRoute.value]);
type NodeTreeMapper = (node: NodeTree) => NodeTree;

/**
 * IDに対応するノードを検索する
 * @param id 検索対象ノードID
 */
const findNodeById = (id: string) => (tree: NodeTree): Option<NodeTree> =>
  tree.value.id === id
    ? some(clone(tree))
    : tree.forest.reduce(
        (before: Option<NodeTree>, current) =>
          isNone(before) ? findNodeById(id)(current) : before,
        none
      );

/**
 * 指定したIDの親要素を返す
 * @param id 子要素のID
 */
const findParentNodeById = (id: string) => (tree: NodeTree): Option<NodeTree> =>
  tree.forest.find(node => node.value.id === id)
    ? some(clone(tree))
    : tree.forest.reduce(
        (before: Option<NodeTree>, current) =>
          isNone(before) ? pipe(current, findParentNodeById(id)) : before,
        none
      );

/**
 * 親ノードから子ノードらを検索する
 * @param id 親ノードID
 */
const _findChildrenByParentId = (id: string) => (tree: NodeTree) =>
  pipe(
    tree,
    findNodeById(id),
    map(node => node.forest)
  );

/**
 * ノード情報を変更する
 * @param id 変更対象ノード
 * @param modifier 変更処理
 */
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

/**
 * 指定ノードを削除する
 * @param id 削除対象ノードID
 */
const _removeNodeById = (id: string) => (treeState: NodeTree): NodeTree => ({
  value: clone(treeState.value),
  forest: treeState.forest
    .filter(i => i.value.id !== id)
    .map(_removeNodeById(id))
});

/**
 * 新しいノードをしてしたノードの子要素に追加する
 * @param id 追加先ノードID
 * @param target 追加するノード
 */
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

/**
 * ノードを移動する
 * @param to 移動するノードID
 * @param target 移動先ノードID
 */
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

/**
 * 現在のルートのノードツリーを更新する
 * @param nodeValue 更新するノード
 */
const updateNode = (nodeValue: NodeTree) =>
  (nodeTree.value[currentRoute.value] = nodeValue);

/**
 * 現在のルートのノードツリーを更新する
 * @param effect ノードを変更する関数
 */
const effectNode = (effect: NodeTreeMapper) =>
  pipe(node.value, effect, updateNode);

/**
 * ドラッグしているノードID
 */
const dragNodeId = ref("");

/**
 * ホバーしてるノードID
 */
const hoverNodeId = ref("");

/**
 * ドロップされたノードID
 */
const dropNodeId = ref("");

/**
 * ドラッグされているタグ名
 */
const dragTag = ref("");

const _copyNode = (id: string) => (tree: NodeTree): void =>
  pipe(
    tree,
    findNodeById(id),
    map(cloneNode),
    fold(
      () => console.log("target is none"),
      target =>
        effectNode(tree =>
          pipe(
            tree,
            findParentNodeById(id),
            map(parent => _addNodeTo(parent.value.id, target)(tree)),
            getOrElse(() => tree)
          )
        )
    )
  );

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

  const findChildrenByParentId = (id: string) =>
    pipe(node.value, _findChildrenByParentId(id));

  /**
   * ルートを追加
   * @param path 新しいパス
   */
  const addNewPath = (path: string) => {
    if (path in nodeTree.value) return;
    nodeTree.value = {
      [path]: make<Node>(
        {
          id: "root",
          tag: "div",
          style: {
            height: "100%"
          }
        },
        []
      ),
      ...nodeTree.value
    };
  };

  const copyNode = (id: string) => pipe(node.value, _copyNode(id));

  return {
    findChildrenByParentId,
    currentRoute,
    addNewPath,
    nodeTree,
    allRoute,
    node,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    findById,
    editNode,
    dragNodeId,
    hoverNodeId,
    dropNodeId,
    dragTag,
    copyNode
  };
};
