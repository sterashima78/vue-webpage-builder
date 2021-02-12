import { NodeTree, GetNodeName, Node, RouteNodeTree } from "@/types";
import { klona as clone } from "klona/json";
import { Option, some, isNone, none, map } from "fp-ts/es6/Option";
import { v4 as uuidv4 } from "uuid";
import merge from "lodash.merge";
import { pipe } from "fp-ts/es6/pipeable";
import { make } from "fp-ts/lib/Tree";
import { InjectionKey } from "@vue/composition-api";

const getNodeName: GetNodeName = ({ name, tag }) => (name ? name : tag);

type CloneOption = { name?: string; postfix?: string };

export const create = (
  nodeOption: Partial<Node>,
  children: NodeTree[] = []
): NodeTree =>
  make<Node>(
    merge(
      {
        id: uuidv4(),
        tag: "div"
      },
      nodeOption
    ),
    children
  );
export const createRoot = (children: NodeTree[] = []) =>
  create(
    {
      id: "root",
      style: {
        height: "100%"
      }
    },
    children
  );

export const cloneNode = ({ name, postfix }: CloneOption = {}) => (
  tree: NodeTree
): NodeTree =>
  make<Node>(
    {
      ...clone(tree.value),
      id: uuidv4(),
      name: `${name === undefined ? getNodeName(tree.value) : name}${
        postfix === undefined ? "_copy" : postfix
      }`
    },
    tree.forest.map(cloneNode({ postfix }))
  );

/**
 * IDに対応するノードを検索する
 * @param id 検索対象ノードID
 */
export const findById = (id: string) => (tree: NodeTree): Option<NodeTree> =>
  tree.value.id === id
    ? some(clone(tree))
    : tree.forest.reduce(
        (before, current) =>
          isNone(before) ? pipe(current, findById(id)) : before,
        none as Option<NodeTree>
      );

/**
 * 指定したIDの親要素を返す
 * @param id 子要素のID
 */
export const findParentById = (id: string) => (
  tree: NodeTree
): Option<NodeTree> =>
  tree.forest.find(node => node.value.id === id)
    ? some(clone(tree))
    : tree.forest.reduce(
        (before, current) =>
          isNone(before) ? pipe(current, findParentById(id)) : before,
        none as Option<NodeTree>
      );

/**
 * ノード情報を変更する
 * @param id 変更対象ノード
 * @param modifier 変更処理
 */
export const edit = (id: string) => (
  modifier: (node: NodeTree) => NodeTree
) => (node: NodeTree): NodeTree => {
  return node.value.id === id
    ? modifier(clone(node))
    : make<Node>(clone(node.value), node.forest.map(pipe(modifier, edit(id))));
};

/**
 * 親ノードから子ノードらを検索する
 * @param id 親ノードID
 */
export const findChildrenByParentId = (id: string) => (tree: NodeTree) =>
  pipe(
    tree,
    findById(id),
    map(node => node.forest)
  );

/**
 * 指定ノードを削除する
 * @param id 削除対象ノードID
 */
export const remove = (id: string) => (tree: NodeTree): NodeTree =>
  make<Node>(
    clone(tree.value),
    tree.forest.filter(i => i.value.id !== id).map(remove(id))
  );

/**
 * 新しいノードをしてしたノードの子要素に追加する
 * @param id 追加先ノードID
 * @param target 追加するノード
 */
export const add = (id: string, target: NodeTree) => (
  tree: NodeTree
): NodeTree =>
  make<Node>(
    clone(tree.value),
    tree.value.id === id
      ? [...clone(tree.forest), clone(target)]
      : tree.forest.map(add(id, target))
  );

/**
 * ノードを移動する
 * @param to 移動するノードID
 * @param target 移動先ノードID
 */
export const move = (to: string, target: string) => (node: NodeTree) => {
  const targetNode = findById(target)(node);
  if (isNone(targetNode)) {
    return node;
  }
  const nodeRemoved = pipe(node, remove(target));
  const toNode = findById(to)(nodeRemoved);
  if (isNone(toNode)) {
    return node;
  }
  return pipe(nodeRemoved, add(to, targetNode.value));
};

export type NodeDao = {
  save: (node: RouteNodeTree) => RouteNodeTree;
  get: () => RouteNodeTree;
};

export const NodeDaoInjectionKey: InjectionKey<NodeDao> = Symbol(
  "NodeDaoInjectionKey"
);
