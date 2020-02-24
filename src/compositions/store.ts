import { ref, Ref } from "@vue/composition-api";
import { NodeTree } from "@/types";
import { make } from "fp-ts/lib/Tree";
export const useState = () => {
  const node: Ref<NodeTree> = ref(
    make({
      id: "root",
      tag: "div",
      text: ""
    })
  );
  return { node };
};
