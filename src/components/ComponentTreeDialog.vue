<template>
  <div>
    <slot name="activator" :toggle="toggle"></slot>
    <hsc-window-style-black v-show="isActive">
      <hsc-window
        title="Componet Tree"
        style="background: white;border:1px solid black;"
        :resizable="true"
        :isScrollable="true"
        :minWidth="300"
        :minHeight="300"
        :maxWidth="500"
        :maxHeight="600"
      >
        <v-treeview
          :items="treeNode.children"
          :hoverable="true"
          style="width:100%;height:100%;color: black !important"
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
            <v-icon @click="setEditTarget(item.id)">tune</v-icon>
            <v-icon @click="removeNodeById(item.id)">delete</v-icon>
          </template>
        </v-treeview>
      </hsc-window>
    </hsc-window-style-black>
    <v-dialog v-model="editorIsActive" persistent>
      <ElementEditor
        :findById="findById"
        :editNodeById="editNodeById"
        :editNode="editNode"
        @close="hide"
        @update="setEditTarget(editNode ? editNode.id : '')"
      />
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from "@vue/composition-api";
import { useTogglable } from "@/compositions/useTogglable";
import { useState } from "@/compositions/store";
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
  setup() {
    const { on, off, isActive: editorIsActive } = useTogglable();
    const {
      node,
      removeNodeById,
      findById,
      editNode: editNodeById
    } = useState();
    const editNode = ref<Node | undefined>(undefined);
    const setEditTarget = (id: string) =>
      pipe(
        findById(id),
        fold(off, node => {
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
