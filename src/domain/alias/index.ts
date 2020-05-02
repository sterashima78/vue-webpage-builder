import { NodeTree } from "@/types";
import { fromNullable, isNone, map } from "fp-ts/es6/Option";
import { cloneNode } from "@/domain/nodes";
import { pipe } from "fp-ts/es6/pipeable";

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

export const regist = (name: string, node: NodeTree) => (alias: NodeAliasMap) =>
  (alias[name] = { name, node });

export const isRegist = (name: string) => (alias: NodeAliasMap) =>
  pipe(alias, findByName(name), isNone);

export const create = (name: string) => (alias: NodeAliasMap) =>
  pipe(alias, findByName(name), map(getNode), map(cloneNode));

export const getAliasNames = (alias: NodeAliasMap): AliasName[] =>
  Object.keys(alias);
