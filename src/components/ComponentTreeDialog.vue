<template>
  <div>
    <slot name="activator" :toggle="toggle">
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn dark icon v-on="{ ...tooltip, click: toggle }">
            <v-icon>format_list_bulleted</v-icon>
          </v-btn>
        </template>
        <span>Component Tree</span>
      </v-tooltip>
    </slot>
    <draggable-window :is-active="isActive">
      <template #title>Componet Tree</template>
      <v-treeview
        dense
        :items="treeNode.children"
        :hoverable="true"
        style="width:100%;height:100%;overflow-y: scroll;"
      >
        <template slot="label" slot-scope="{ item }">
          <div
            :id="item.id"
            draggable="true"
            style="cursor: move"
            v-web-builder
            v-text="item.name"
          />
        </template>
        <template #append="{ item }">
          <v-icon @click="setEditTarget(item)">tune</v-icon>
          <AliasRegister :node-id="item.id" />
          <v-icon @click="copyNode(item.id)">mdi-content-copy</v-icon>
          <v-icon @click="removeNodeById(item.id)">delete</v-icon>
        </template>
      </v-treeview>
    </draggable-window>
    <v-dialog v-model="editorIsActive" scrollable persistent>
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
import { defineComponent, computed, ref, inject } from "@vue/composition-api";
import DraggableWindow from "./DraggableWindow.vue";
import ElementEditor from "./ElementEditor.vue";
import { useTogglable } from "@/compositions/useTogglable";
import { useState } from "@/compositions/useNodeState";
import { fold } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/es6/pipeable";
import { Node, NodeTree } from "@/types";
import { NodeDaoInjectionKey } from "@/domain/nodes";
import { AliasDaoInjectionKey } from "@/domain/alias";

interface TreeView {
  id: string;
  name: string;
  children: TreeView[];
}
const toTree = (node: NodeTree): TreeView => {
  return {
    id: node.value.id,
    name: node.value.name || node.value.tag,
    children: node.forest.map(toTree)
  };
};
export default defineComponent({
  components: {
    ElementEditor,
    DraggableWindow,
    AliasRegister: () => import("./AliasRegister.vue")
  },
  setup() {
    const nodeDao = inject(NodeDaoInjectionKey);
    const aliasDao = inject(AliasDaoInjectionKey);
    if (!nodeDao || !aliasDao) {
      throw new Error("Dao is not injected");
    }
    const { on, off, isActive: editorIsActive } = useTogglable();
    const {
      node,
      removeNodeById,
      findById,
      editNode: editNodeById,
      copyNode
    } = useState(nodeDao, aliasDao);
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
      setEditTarget,
      copyNode
    };
  }
});
</script>
