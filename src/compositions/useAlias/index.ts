import {
  findByName,
  create,
  regist,
  isRegist,
  getAliasNames,
  NodeAliasMap
} from "@/domain/alias";
import { Ref, ref, computed } from "@vue/composition-api";
import { pipe } from "fp-ts/es6/pipeable";
import { NodeTree } from "@/types";

const alias: Ref<NodeAliasMap> = ref({});

export const useAlias = () => {
  return {
    aliases: computed(() => pipe(alias.value, getAliasNames)),
    regist: (name: string, node: NodeTree) =>
      pipe(alias.value, regist(name, node)),
    findByName: (name: string) => pipe(alias.value, findByName(name)),
    create: (name: string) => pipe(alias.value, create(name)),
    isRegist: (name: string) => pipe(alias.value, isRegist(name))
  };
};
