import "@/plugin/";
import { ref, watch, Ref } from "@vue/composition-api";
import Vue, { VueConstructor } from "vue";
import { fromNullable, map, getOrElse } from "fp-ts/es6/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { CreateElement, VNode } from "vue/types/umd";
import { NodeData } from "@/types";
import { useState, toNodeData } from "./store/";
export const useLocalVue = (dragTag: Ref<string>) => {
  const ids: string[] = [];
  const dropTargetId = ref("");
  const { node, treeNode, addNodeTo, removeNodeById, moveNodeTo } = useState();
  setInterval(() => {
    const id = Math.random().toString(32);
    ids.push(id);
    addNodeTo(`c${Math.floor(Math.random() * 3) + 1}`, {
      id,
      tag: "div",
      text: "append!!",
      style: {
        "margin-left": "10px"
      }
    });
  }, 1000);
  setInterval(() => {
    const id = ids.splice(Math.floor(Math.random() * ids.length), 1)[0];
    removeNodeById(id);
  }, 3000);
  setInterval(() => {
    const to = Math.floor(Math.random() * ids.length);
    const target = Math.floor(Math.random() * ids.length);
    moveNodeTo(ids[to], ids[target]);
  }, 1000);
  const components = ref<string[]>([]);
  const rederNode = (
    h: CreateElement,
    { tag, data, children }: NodeData
  ): VNode => {
    return h(
      tag,
      {
        ...data,
        on: {
          dragenter: ($event: DragEvent) => {
            $event.stopPropagation();
            dropTargetId.value = data.attrs && data.attrs.id;
          },
          dragleave: ($event: DragEvent) => {
            $event.stopPropagation();
            if ((data.attrs && data.attrs.id) === dropTargetId.value)
              dropTargetId.value = "";
          },
          dragover: ($event: DragEvent) => $event.preventDefault(),
          drop: ($event: DragEvent) => {
            $event.stopPropagation();
            addNodeTo(dropTargetId.value, {
              tag: dragTag.value,
              id: Math.random().toString(32),
              text: "default"
            });
          }
        }
      },
      children.map(i => (typeof i === "string" ? i : rederNode(h, i)))
    );
  };
  const init = (w: Window & { Vue?: VueConstructor<Vue> }) => {
    if (w.Vue === undefined) {
      return setTimeout(init, 100);
    }
    components.value = pipe(
      fromNullable(w.Vue as any),
      map(i => i.options),
      map(i => i.components),
      map(i => Object.keys(i)),
      getOrElse(() => [] as string[])
    );
    const store = w.Vue.observable({ node: node.value });
    watch(node, v => {
      store.node = v;
    });
    const vm = new w.Vue({
      el: "#main-wrapper",
      render(h) {
        return rederNode(h, toNodeData(store.node));
      }
    });
  };
  return { init, components, treeNode };
};
