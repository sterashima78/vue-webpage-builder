import { ref, Ref } from "@vue/composition-api";
import { NodeTree } from "@/types";
import { make } from "fp-ts/lib/Tree";
import { VNodeData } from "vue";
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

export interface NodeData {
  tag: string;
  data: VNodeData;
  children: Array<NodeData | string>;
}

export const toNodeData = (tree: NodeTree): NodeData => {
  const { tag, text, id } = tree.value;
  const texts = text ? [text] : [];
  return {
    tag,
    data: {
      attrs: {
        id
      }
    },
    children: [...tree.forest.map(toNodeData), ...texts]
  };
};
