import "@/plugins/";
import { ref, Ref, computed, ComputedRef } from "@vue/composition-api";
import { NodeTree, RouteNodeTree } from "@/types";
import { pipe } from "fp-ts/lib/pipeable";
import { map, fold, getOrElse } from "fp-ts/lib/Option";
import {
  createRoot,
  cloneNode,
  findById,
  findParentById,
  edit,
  findChildrenByParentId,
  remove,
  add,
  move,
  create,
  NodeDao
} from "@/domain/nodes";
import { useAlias } from "@/compositions/useAlias";
import { init } from "./initState";
import { AliasDao } from "@/domain/alias";
import {
  RouteNodes,
  NodeTree as AppNodeTree,
  EleNode
} from "@sterashima/vue-component-sandbox";

import { klona } from "klona/json";

/**
 * ノードの状態
 */
const nodeTree = ref<RouteNodeTree>({});
/**
 * 現在のルート
 */
const currentRoute = ref<string>("/");

/**
 * 全ルート
 */
export const toAllRoute = (nodes: Ref<RouteNodeTree>) => () =>
  Object.keys(nodes.value);
const allRoute = computed(toAllRoute(nodeTree));

/**
 * 現在のルートのノードツリー
 */
export const toCurrentNode = (
  nodes: Ref<RouteNodeTree>,
  path: Ref<string>
) => () => nodes.value[path.value];
const node = computed(toCurrentNode(nodeTree, currentRoute));
type NodeTreeMapper = (node: NodeTree) => NodeTree;

/**
 * 現在のルートのノードツリーを更新する
 * @param nodeValue 更新するノード
 */
export type Update = (nodeValue: NodeTree) => void;
export const updateNode = (
  client: NodeDao,
  nodes: Ref<RouteNodeTree>,
  path: Ref<string>
) => (nodeValue: NodeTree) => {
  nodes.value[path.value] = nodeValue;
  client.save(nodes.value);
};

/**
 * 現在のルートのノードツリーを更新する
 * @param effect ノードを変更する関数
 */
export const effectNode = (nodes: ComputedRef<NodeTree>, update: Update) => (
  effect: NodeTreeMapper
) => pipe(nodes.value, effect, update);
type Effect = ReturnType<typeof effectNode>;

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

const _copyNode = (effect: Effect) => (id: string) => (tree: NodeTree): void =>
  pipe(
    tree,
    findById(id),
    map(cloneNode()),
    fold(
      () => console.log("target is none"),
      target =>
        effect(tree =>
          pipe(
            tree,
            findParentById(id),
            map(parent => add(parent.value.id, target)(tree)),
            getOrElse(() => tree)
          )
        )
    )
  );

type ToNodeTree = (
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>
) => (node: NodeTree) => AppNodeTree;

export const toNodeTree: ToNodeTree = (hoverId, dropId) => {
  const convert = (node: NodeTree): AppNodeTree => {
    const {
      tag,
      text,
      id,
      attributes,
      style,
      classes,
      slot,
      on,
      domProps
    } = klona(node.value);
    const texts = text ? [text] : [];
    const styles = style || {};
    const children = node.forest;
    if (hoverId.value === id || dropId.value === id) {
      styles["box-sizing"] = "border-box";
    }
    if (hoverNodeId.value === id) styles.border = "solid red 2px";
    if (dropNodeId.value === id) styles.border = "solid blue 2px";
    const value: EleNode = {
      id,
      tag,
      classes,
      attributes,
      slot,
      on,
      domProps,
      style: styles
    };
    return {
      value,
      children: [...children.map(convert), ...texts]
    };
  };
  return convert;
};

type ToRouteNodes = (
  nodes: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  converter: ToNodeTree
) => () => RouteNodes;

export const toRouteNodes: ToRouteNodes = (
  nodes,
  hoverId,
  dropId,
  converter
) => {
  const convert = converter(hoverId, dropId);
  return () =>
    pipe(
      Object.entries(nodes.value).map(([path, node]) => [path, convert(node)]),
      Object.fromEntries
    );
};

export const useState = (client: NodeDao, aliasDao: AliasDao) => {
  if (Object.keys(nodeTree.value).length === 0)
    nodeTree.value = client.get() || init();
  const update = updateNode(client, nodeTree, currentRoute);
  const effect = effectNode(node, update);
  /**
   * ノードをツリーに追加する
   * @param id 追加先ノードのID
   * @param target 追加するノード
   */
  const addNodeTo = (id: string, target: NodeTree) => effect(add(id, target));
  /**
   * ノードをツリーから削除する
   * @param id 削除するノード
   */
  const removeNodeById = (id: string) => effect(remove(id));

  /**
   * ノードを別ノードの子ノードへ追加する
   * @param to 移動先ノードのID
   * @param target 移動するノードのID
   */
  const moveNodeTo = (to: string, target: string) => effect(move(to, target));
  /**
   * ノードを変更する
   * @param id 変更対象ノードのID
   * @param modifier 変更処理
   */
  const editNode = (id: string, modifier: NodeTreeMapper) =>
    effect(pipe(modifier, edit(id)));

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
      [path]: createRoot(),
      ...nodeTree.value
    };
  };

  const copyNode = (id: string) => pipe(node.value, _copyNode(effect)(id));

  const { create: createAlias } = useAlias(aliasDao);
  const dropElement = () => {
    if (dragTag.value !== "") {
      addNodeTo(
        dropNodeId.value,
        pipe(
          dragTag.value,
          createAlias,
          getOrElse(() =>
            create({
              tag: dragTag.value,
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
    dropElement,
    nodes: computed(toRouteNodes(nodeTree, hoverNodeId, dropNodeId, toNodeTree))
  };
};
