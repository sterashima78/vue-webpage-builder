import { NodeTree } from "@/types";
import { fromNullable, map, isSome } from "fp-ts/es6/Option";
import { cloneNode } from "@/domain/nodes";
import { pipe } from "fp-ts/es6/pipeable";
import { InjectionKey } from "@vue/composition-api";

export type NodeAlias = {
  node: NodeTree;
  name: AliasName;
};

export type NodeAliasMap = {
  [key: string]: NodeAlias;
};

export type AliasName = Extract<keyof NodeAliasMap, string>;

export const getNode = (alias: NodeAlias) => alias.node;

export const findByName = (name: string) => (alias: NodeAliasMap) =>
  fromNullable(alias[name]);

export const regist = (name: string, node: NodeTree) => (
  alias: NodeAliasMap
) => ({ ...alias, [name]: { name, node } });

export const isRegist = (name: string) => (alias: NodeAliasMap) =>
  pipe(alias, findByName(name), isSome);

export const create = (name: string) => (alias: NodeAliasMap) =>
  pipe(
    alias,
    findByName(name),
    map(getNode),
    map(cloneNode({ name, postfix: "" }))
  );

export const getAliasNames = (alias: NodeAliasMap): AliasName[] =>
  Object.entries(alias).map(i => i[1].name);

export type AliasDao = {
  save: (alias: NodeAliasMap) => NodeAliasMap;
  get: () => NodeAliasMap;
};

export const AliasDaoInjectionKey: InjectionKey<AliasDao> = Symbol(
  "AliasDaoInjectionKey"
);
