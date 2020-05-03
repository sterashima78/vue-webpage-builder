import "@/plugins/";
import { ref, Ref, computed } from "@vue/composition-api";
import { NodeTree, Node, RouteNodeTree } from "@/types";
import { make, tree } from "fp-ts/lib/Tree";
import { pipe } from "fp-ts/lib/pipeable";
import { map, fold, getOrElse } from "fp-ts/lib/Option";
import {
  cloneNode,
  findById,
  findParentById,
  edit,
  findChildrenByParentId,
  remove,
  add,
  move
} from "@/domain/nodes";
import { useAlias } from "@/compositions/useAlias";
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
    findById(id),
    map(cloneNode()),
    fold(
      () => console.log("target is none"),
      target =>
        effectNode(tree =>
          pipe(
            tree,
            findParentById(id),
            map(parent => add(parent.value.id, target)(tree)),
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
    effectNode(add(id, target));
  /**
   * ノードをツリーから削除する
   * @param id 削除するノード
   */
  const removeNodeById = (id: string) => effectNode(remove(id));

  /**
   * ノードを別ノードの子ノードへ追加する
   * @param to 移動先ノードのID
   * @param target 移動するノードのID
   */
  const moveNodeTo = (to: string, target: string) =>
    effectNode(move(to, target));
  /**
   * ノードを変更する
   * @param id 変更対象ノードのID
   * @param modifier 変更処理
   */
  const editNode = (id: string, modifier: NodeTreeMapper) =>
    effectNode(pipe(modifier, edit(id)));

  /**
   * ノードツリーからIDに相当するノードを検索する
   * @param id 検索対象ID
   */
  const _findById = (id: string) => pipe(node.value, findById(id));

  const _findChildrenByParentId = (id: string) =>
    pipe(node.value, findChildrenByParentId(id));

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

  const { create } = useAlias();
  const dropElement = () => {
    if (dragTag.value !== "") {
      addNodeTo(
        dropNodeId.value,
        pipe(
          dragTag.value,
          create,
          getOrElse(() =>
            tree.of<Node>({
              tag: dragTag.value,
              id: Math.random().toString(32),
              text: "default"
            })
          )
        )
      );
      dragTag.value = "";
    }
    if (dragNodeId.value !== "") {
      moveNodeTo(dropNodeId.value, dragNodeId.value);
      dragNodeId.value = "";
    }
    dropNodeId.value = "";
  };

  return {
    findChildrenByParentId: _findChildrenByParentId,
    currentRoute,
    addNewPath,
    nodeTree,
    allRoute,
    node,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    findById: _findById,
    editNode,
    dragNodeId,
    hoverNodeId,
    dropNodeId,
    dragTag,
    copyNode,
    dropElement
  };
};
