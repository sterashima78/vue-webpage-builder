<template>
  <div style="height: 100%">
    <span
      style="display: inline-block;padding: 5px;cursor: move"
      v-for="component in components"
      v-text="component"
      :key="component"
      draggable="true"
      @dragstart="dragTag = component"
    />
    <div style="display:flex;width:100%;height:100%">
      <VIframeSandbox
        :body="body"
        style="width:80%;height:100%"
        :script="inlineScript"
        :scriptsSrc="scriptsSrc"
        :styles="stylesStr"
        :cssLinks="cssLinks"
        @loaded="loaded"
      />
      <v-treeview
        :items="treeNode.children"
        :hoverable="true"
        style="width:20%;height:100%"
      >
        <template slot="label" slot-scope="{ item }">
          <div
            :id="item.id"
            draggable="true"
            style="cursor: move"
            @mouseenter="cancelEvent"
            @mouseover="mouseOver"
            @mouseleave="mouseLeave"
            @dragstart="dragStart"
            @dragleave="dragLeave"
            @dragenter="dragEnter"
            @dragover="cancelEvent"
            @dragend="dragEnd"
            @drop="drop"
          >
            {{ item.name }}
          </div>
        </template>
        <template #append="{ item }">
          <v-icon @click="activeDialog(item.id)">tune</v-icon>
          <v-icon @click="removeNodeById(item.id)">delete</v-icon>
        </template>
      </v-treeview>
    </div>
    <v-dialog v-model="dialog" persistent>
      <ElementEditor
        :findById="findById"
        :editNodeById="editNodeById"
        :editNode="editNode"
        @close="dialog = false"
        @update="setEditTarget(editNode.id)"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import "@/plugin";
import ElementEditor from "@/components/ElementEditor.vue";
import { isNone } from "fp-ts/lib/Option";
import { VIframeSandbox } from "vue-iframe-sandbox";
import { defineComponent, ref } from "@vue/composition-api";
import { useLocalVue } from "@/compositions/localVue";
import { Node } from "@/types";
import {
  mouseOver,
  mouseLeave,
  dragStart,
  dragLeave,
  dragEnd,
  dragEnter,
  cancelEvent,
  drop
} from "@/compositions/store";
export default defineComponent({
  name: "Home",
  components: {
    VIframeSandbox,
    ElementEditor
  },
  setup() {
    const dragTag = ref("");
    const scriptsSrc = [
      "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.js",
      "https://unpkg.com/element-ui/lib/index.js"
    ];
    const cssLinks = ["https://unpkg.com/element-ui/lib/theme-chalk/index.css"];
    const body = `<div id='main-wrapper' />`;
    // const scriptsSrc = {
    //   element: {
    //     name: "element",
    //     url: "https://unpkg.com/element-ui/lib/index.js"
    //   }
    // };
    // const cssLinks = {
    //   element: {
    //     name: "element",
    //     url: "https://unpkg.com/element-ui/lib/theme-chalk/index.css"
    //   }
    // };
    const inlineScript = ``;
    const stylesStr = "";
    const {
      init: loaded,
      components,
      treeNode,
      hoverNodeId,
      dragNodeId,
      dropNodeId,
      moveNodeTo,
      addNodeTo,
      findById,
      editNode: editNodeById
    } = useLocalVue(dragTag);
    const dialog = ref(false);
    const editNode = ref<Node | undefined>(undefined);
    const setEditTarget = (id: string) => {
      const node = findById(id);
      if (isNone(node)) return false;
      editNode.value = node.value.value;
      return true;
    };
    const activeDialog = (id: string) => {
      dialog.value = setEditTarget(id);
    };
    return {
      findById,
      editNodeById,
      editNode,
      activeDialog,
      dialog,
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded,
      body,
      components,
      dragTag,
      treeNode,
      mouseOver: mouseOver(hoverNodeId),
      mouseLeave: mouseLeave(hoverNodeId),
      cancelEvent,
      dragStart: dragStart(dragNodeId),
      dragLeave: dragLeave(dropNodeId),
      dragEnd: dragEnd(dragNodeId),
      dragEnter: dragEnter(dropNodeId),
      drop: drop(dragTag, dragNodeId, dropNodeId, addNodeTo, moveNodeTo),
      setEditTarget
    };
  }
});
</script>
