<template>
  <div>
    <slot name="activator" :toggle="toggle"></slot>
    <draggable-window :is-active="isActive">
      <template #title>Componet Tree</template>
      <v-treeview
        dense
        :items="treeNode.children"
        :hoverable="true"
        style="width:100%;height:100%;"
      >
        <template slot="label" slot-scope="{ item }">
          <div
            :id="item.id"
            draggable="true"
            style="cursor: move"
            v-web-builder
          >
            {{ item.name }}
          </div>
        </template>
        <template #append="{ item }">
          <v-icon @click="setEditTarget(item)">tune</v-icon>
          <v-icon @click="removeNodeById(item.id)">delete</v-icon>
        </template>
      </v-treeview>
    </draggable-window>
    <v-dialog v-model="editorIsActive" persistent>
      <ElementEditor
        :findById="findById"
        :editNodeById="editNodeById"
        :editNode="editNode"
        @close="hide"
        @update="setEditTarget(editNode)"
      />
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import DraggableWindow from "./DraggableWindow.vue";
import ElementEditor from "./ElementEditor.vue";
import { useTogglable } from "@/compositions/useTogglable";
import { useState } from "@/compositions/useNodeState";
import { fold } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { Node, NodeTree } from "@/types";

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
export default defineComponent({
  components: {
    ElementEditor,
    DraggableWindow
  },
  setup() {
    const { on, off, isActive: editorIsActive } = useTogglable();
    const {
      node,
      removeNodeById,
      findById,
      editNode: editNodeById
    } = useState();
    const editNode = ref<Node>({
      id: "",
      tag: "div"
    });
    const setEditTarget = (n?: Node) =>
      pipe(
        findById(n ? n.id : ""),
        fold(off, (node: NodeTree) => {
          editNode.value = node.value;
          return on();
        })
      );
    const treeNode = computed(() => toTree(node.value));
    const { toggle, isActive } = useTogglable();
    return {
      treeNode,
      toggle,
      isActive,
      removeNodeById,
      show: on,
      hide: off,
      editorIsActive,
      editNode,
      findById,
      editNodeById,
      setEditTarget
    };
  }
});
</script>
