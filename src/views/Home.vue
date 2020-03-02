<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="showTree = !showTree">
        <v-icon>format_list_bulleted</v-icon>
      </v-btn>
      <v-btn icon @click="showWindow = !showWindow">
        <v-icon>code</v-icon>
      </v-btn>
      <v-btn icon @click="showSetting = !showSetting">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-app-bar>
    <div style="display:flex;width:100%;height: calc(100% - 50px)">
      <VIframeSandbox
        :body="body"
        style="width:100%;height:100%"
        :script="inlineScript"
        :scriptsSrc="scriptsSrc"
        :styles="stylesStr"
        :cssLinks="cssLinks"
        @loaded="loaded"
      />
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
    <hsc-window-style-black>
      <hsc-window
        v-show="showTree"
        title="Componet Tree"
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
          style="width:100%;height:100%"
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
      </hsc-window>

      <hsc-window
        v-show="showWindow"
        title="Components"
        :resizable="true"
        :isScrollable="true"
        :minWidth="300"
        :minHeight="300"
        :maxWidth="500"
        :maxHeight="600"
      >
        <span
          style="display: inline-block;padding: 5px;cursor: move"
          v-for="component in components"
          v-text="component"
          :key="component"
          draggable="true"
          @dragstart="dragTag = component"
        />
      </hsc-window>
    </hsc-window-style-black>
    <v-dialog
      v-model="showSetting"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showSetting = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="showSetting = false">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>User Controls</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Content filtering</v-list-item-title>
              <v-list-item-subtitle
                >Set the content filtering level to restrict apps that can be
                downloaded</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Password</v-list-item-title>
              <v-list-item-subtitle
                >Require password for purchase or use password to restrict
                purchase</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Notifications</v-list-item-title>
              <v-list-item-subtitle
                >Notify me about updates to apps or games that I
                downloaded</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Sound</v-list-item-title>
              <v-list-item-subtitle
                >Auto-update apps at any time. Data charges may
                apply</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-action>
              <v-checkbox></v-checkbox>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Auto-add widgets</v-list-item-title>
              <v-list-item-subtitle
                >Automatically add home screen widgets</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
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
      setEditTarget,
      showWindow: ref(true),
      showTree: ref(true),
      showSetting: ref(true)
    };
  }
});
</script>
