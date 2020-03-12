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
    console.log("target is none");
    return node;
  }
  console.log(targetNode.value);
  const nodeRemoved = _removeNodeById(target)(node);
  const toNode = findNodeById(to)(nodeRemoved);
  if (isNone(toNode)) {
    console.log("to is none");
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

export const mouseOver = (hoverNodeId: Ref<string>) => ($event: MouseEvent) => {
  $event.stopPropagation();
  $event.preventDefault();
  const target = ($event.target as HTMLElement) || undefined;
  hoverNodeId.value = (target && target.id) || "";
};

export const mouseLeave = (hoverNodeId: Ref<string>) => (
  $event: MouseEvent
) => {
  $event.preventDefault();
  $event.stopPropagation();
  const target = ($event.target as HTMLElement) || undefined;
  if (
    (target && target.id) === hoverNodeId.value ||
    "root" === (target && target.id)
  )
    hoverNodeId.value = "";
};

export const cancelEvent = ($event: MouseEvent) => {
  $event.stopPropagation();
  $event.preventDefault();
};

export const dragEnter = (dropNodeId: Ref<string>) => ($event: MouseEvent) => {
  $event.stopPropagation();
  const target = ($event.target as HTMLElement) || undefined;
  dropNodeId.value = (target && target.id) || "";
};

export const dragStart = (dragNodeId: Ref<string>) => ($event: MouseEvent) => {
  $event.stopPropagation();
  const target = ($event.target as HTMLElement) || undefined;
  dragNodeId.value = target && target.id;
};

export const dragLeave = (dropNodeId: Ref<string>) => ($event: MouseEvent) => {
  $event.stopPropagation();
  const target = ($event.target as HTMLElement) || undefined;
  if ((target && target.id) === dropNodeId.value) dropNodeId.value = "";
};

export const dragEnd = (dragNodeId: Ref<string>) => ($event: MouseEvent) => {
  $event.stopPropagation();
  const target = ($event.target as HTMLElement) || undefined;
  if ((target && target.id) === dragNodeId.value) dragNodeId.value = "";
};

export const drop = (
  dragTag: Ref<string>,
  dragNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  addNodeTo: (to: string, target: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void
) => ($event: MouseEvent) => {
  console.log("drop", dragNodeId.value, dropNodeId.value);
  $event.stopPropagation();
  if (dragTag.value !== "") {
    addNodeTo(
      dropNodeId.value,
      tree.of<Node>({
        tag: dragTag.value,
        id: Math.random().toString(32),
        text: "default"
      })
    );
    dragTag.value = "";
  }
  if (dragNodeId.value !== "") {
    moveNodeTo(dropNodeId.value, dragNodeId.value);
    dragNodeId.value = "";
  }
  dropNodeId.value = "";
};

const toNodeData = (
  hoverNodeId: Ref<string>,
  dropNodeId: Ref<string>,
  dragNodeId: Ref<string>,
  dragTag: Ref<string>,
  addNodeTo: (to: string, node: NodeTree) => void,
  moveNodeTo: (to: string, target: string) => void
) => (tree: NodeTree): NodeData => {
  const { tag, text, id, attributes, style, classes } = clone(tree.value);
  const texts = text ? [text] : [];
  const styles = style || {};
  if (hoverNodeId.value === id) styles.border = "solid red 5px";
  if (dropNodeId.value === id) styles.border = "solid blue 5px";
  return {
    tag,
    data: {
      attrs: {
        id,
        draggable: true
      },
      on: {
        mouseover: mouseOver(hoverNodeId),
        mouseenter: cancelEvent,
        mouseleave: mouseLeave(hoverNodeId),
        dragenter: dragEnter(dropNodeId),
        dragleave: dragLeave(dropNodeId),
        dragover: cancelEvent,
        dragstart: dragStart(dragNodeId),
        dragend: dragEnd(dragNodeId),
        drop: drop(dragTag, dragNodeId, dropNodeId, addNodeTo, moveNodeTo)
      },
      props: attributes,
      style: styles,
      class: classes
    },
    children: [
      ...tree.forest.map(
        toNodeData(
          hoverNodeId,
          dropNodeId,
          dragNodeId,
          dragTag,
          addNodeTo,
          moveNodeTo
        )
      ),
      ...texts
    ]
  };
};
const updateNode = (nodeValue: NodeTree) => (node.value = nodeValue);

const effectNode = (effect: NodeTreeMapper) =>
  pipe(node.value, effect, updateNode);

export const useState = (dragTag: Ref<string>) => {
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
  const dragNodeId = ref("");
  const hoverNodeId = ref("");
  const dropNodeId = ref("");
  const nodeDataTree = computed(() =>
    pipe(
      node.value,
      toNodeData(
        hoverNodeId,
        dropNodeId,
        dragNodeId,
        dragTag,
        addNodeTo,
        moveNodeTo
      )
    )
  );

  return {
    node,
    dragNodeId,
    dropNodeId,
    hoverNodeId,
    treeNode,
    addNodeTo,
    removeNodeById,
    moveNodeTo,
    findById,
    nodeDataTree,
    editNode
  };
};
