import {
  findByName,
  create,
  isRegist,
  regist,
  getAliasNames,
  NodeAliasMap,
  AliasDao
} from "@/domain/alias";
import { Ref, ref, computed } from "@vue/composition-api";
import { pipe } from "fp-ts/es6/pipeable";
import { NodeTree } from "@/types";
import { init } from "./initState";

const alias: Ref<NodeAliasMap> = ref({});

export const useAlias = (client: AliasDao) => {
  if (Object.keys(alias.value).length === 0)
    alias.value = client.get() || init();
  return {
    aliases: computed(() => pipe(alias.value, getAliasNames)),
    regist: (name: string, node: NodeTree) => {
      alias.value = pipe(alias.value, regist(name, node));
      client.save(alias.value);
    },
    findByName: (name: string) => pipe(alias.value, findByName(name)),
    create: (name: string) => pipe(alias.value, create(name)),
    isRegist: (name: string) => pipe(alias.value, isRegist(name))
  };
};
