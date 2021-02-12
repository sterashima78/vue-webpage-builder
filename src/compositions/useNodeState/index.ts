import "@/plugins/";
import { ref, Ref, computed, watch } from "@vue/composition-api";
import { NodeTree, RouteNodeTree, RouteNodeTreeData } from "@/types";
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
import Worker from "worker-loader!./createNodeData.worker";
import { RouteNodes } from "@sterashima/vue-component-sandbox";
import { toNodeTree } from "./converter";
import throttle from "lodash.throttle";

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
const node = computed(() => nodeTree.value[currentRoute.value]);
type NodeTreeMapper = (node: NodeTree) => NodeTree;

/**
 * 現在のルートのノードツリーを更新する
 * @param nodeValue 更新するノード
 */
const updateNode = (client: NodeDao) => (nodeValue: NodeTree) => {
  nodeTree.value[currentRoute.value] = nodeValue;
  client.save(nodeTree.value);
};

/**
 * 現在のルートのノードツリーを更新する
 * @param effect ノードを変更する関数
 */
const effectNode = (client: NodeDao) => (effect: NodeTreeMapper) =>
  pipe(node.value, effect, updateNode(client));

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

const _copyNode = (client: NodeDao) => (id: string) => (tree: NodeTree): void =>
  pipe(
    tree,
    findById(id),
    map(cloneNode()),
    fold(
      () => console.log("target is none"),
      target =>
        effectNode(client)(tree =>
          pipe(
            tree,
            findParentById(id),
            map(parent => add(parent.value.id, target)(tree)),
            getOrElse(() => tree)
          )
        )
    )
  );

const convertData = (
  node: Ref<RouteNodeTree>,
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>
) => {
  const _nodeData = ref<RouteNodeTreeData>({});
  const nodeData = computed(() =>
    Object.keys(_nodeData.value).reduce((obj, path) => {
      obj[path] = toNodeTree(_nodeData.value[path]);
      return obj;
    }, {} as RouteNodes)
  );
  const worker = new Worker();
  worker.onmessage = (event: any) => {
    _nodeData.value = event.data;
  };
  const sendMsg = throttle(
    () =>
      worker.postMessage({
        hoverNodeId: hoverNodeId.value,
        dropNodeId: dropNodeId.value,
        node: node.value
      }),
    16
  );
  watch(node, sendMsg, {
    immediate: true
  });
  watch(hoverNodeId, sendMsg, {
    immediate: true
  });
  watch(dropNodeId, sendMsg, {
    immediate: true
  });
  return nodeData;
};

export const useState = (client: NodeDao, aliasDao: AliasDao) => {
  if (Object.keys(nodeTree.value).length === 0)
    nodeTree.value = client.get() || init();
  const effect = effectNode(client);
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

  const copyNode = (id: string) => pipe(node.value, _copyNode(client)(id));

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
    nodes: convertData(nodeTree, hoverNodeId, dropNodeId)
  };
};
