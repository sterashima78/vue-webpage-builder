import {
  findByName,
  create,
  isRegist,
  regist,
  getAliasNames,
  NodeAliasMap
} from "@/domain/alias";
import { Ref, ref, computed } from "@vue/composition-api";
import { pipe } from "fp-ts/es6/pipeable";
import { NodeTree, Node } from "@/types";
import { make, tree } from "fp-ts/lib/Tree";

const list = ["default", "primary", "success", "info", "warning", "danger"];

const alias: Ref<NodeAliasMap> = ref({
  Buttons: {
    node: make<Node>(
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
    name: "Buttons"
  }
});

export const useAlias = () => {
  return {
    aliases: computed(() => pipe(alias.value, getAliasNames)),
    regist: (name: string, node: NodeTree) =>
      (alias.value = pipe(alias.value, regist(name, node))),
    findByName: (name: string) => pipe(alias.value, findByName(name)),
    create: (name: string) => pipe(alias.value, create(name)),
    isRegist: (name: string) => pipe(alias.value, isRegist(name))
  };
};
