<template>
  <div style="height: 100%">
    <v-app-bar color="deep-purple accent-4" dense dark>
      <v-toolbar-title>Vue Webpage Builder</v-toolbar-title>
      <v-spacer></v-spacer>
      <ComponentTreeDialog :eventHandler="eventHandler">
        <template #activator="{ toggle }">
          <v-btn icon @click="toggle">
            <v-icon>format_list_bulleted</v-icon>
          </v-btn>
        </template>
      </ComponentTreeDialog>
      <ComponentSelectorDialog
        :components="components"
        @select="dragTag = $event"
      >
        <template #activator="{ toggle }">
          <v-btn icon @click="toggle">
            <v-icon>view_quilt</v-icon>
          </v-btn>
        </template>
      </ComponentSelectorDialog>

      <SettingDialog
        :code="inlineScript"
        :scripts="scripts"
        :styles="styles"
        @add:script="addScript"
        @add:style="addStyle"
        @remove:script="removeScript"
        @remove:style="removeStyle"
      >
        <template #activator="{ open }">
          <v-btn icon @click="open">
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
      </SettingDialog>
      <FileMenu>
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>insert_drive_file</v-icon>
          </v-btn>
        </template>
      </FileMenu>
    </v-app-bar>
    <div style="display:flex;width:100%;height: calc(100% - 50px)">
      <VueCanvas @loaded="loaded" />
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
          style="width:100%;height:100%"
        >
          <template slot="label" slot-scope="{ item }">
            <div
              :id="item.id"
              draggable="true"
              style="cursor: move"
              @mouseenter="eventHandler.mouseenter"
              @mouseover="eventHandler.mouseover"
              @mouseleave="eventHandler.mouseleave"
              @dragstart="eventHandler.dragstart"
              @dragleave="eventHandler.dragleave"
              @dragenter="eventHandler.dragenter"
              @dragover="eventHandler.dragover"
              @dragend="eventHandler.dragend"
              @drop="eventHandler.drop"
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
    </hsc-window-style-black>
  </div>
</template>

<script lang="ts">
import "@/plugin";
import ElementEditor from "@/components/ElementEditor.vue";
import ComponentSelectorDialog from "@/components/ComponentSelectorDialog.vue";
import SettingDialog from "@/components/SettingDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import VueCanvas from "@/components/VueCanvas.vue";
import ComponentTreeDialog from "@/components/ComponentTreeDialog.vue";
import { isNone } from "fp-ts/lib/Option";
import { defineComponent, ref, computed, Ref } from "@vue/composition-api";
import { useLocalVue, eventHandlers } from "@/compositions/LocalVue/";
import { useState } from "@/compositions/store/";
import { useHtml } from "@/compositions/useHtml";
import { Node, Resource } from "@/types";

export default defineComponent({
  name: "Home",
  components: {
    ElementEditor,
    ComponentSelectorDialog,
    SettingDialog,
    FileMenu,
    VueCanvas,
    ComponentTreeDialog
  },
  setup() {
    const file = ref<File | undefined>(undefined);
    const {
      scripts,
      styles,
      scriptsSrc,
      cssLinks,
      body,
      inlineScript,
      stylesStr
    } = useHtml();
    const { init, dragTag, eventHandler } = useLocalVue();
    const {
      node,
      treeNode,
      findById,
      editNode: editNodeById,
      removeNodeById
    } = useState();
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
    const components = ref<string[]>([]);

    return {
      removeNodeById,
      findById,
      editNodeById,
      editNode,
      activeDialog,
      dialog,
      scriptsSrc,
      cssLinks,
      inlineScript,
      stylesStr,
      loaded: async w => {
        const c = await init(w);
        console.log("reload");
        components.value = c;
      },
      body,
      components,
      dragTag,
      treeNode,
      eventHandler,
      setEditTarget,
      showWindow: ref(false),
      showTree: ref(false),
      showSetting: ref(false),
      addStyle: ({ url, name }: { url: string; name: string }) => {
        styles.value.push({ url, name });
      },
      addScript: ({ url, name }: { url: string; name: string }) => {
        scripts.value.push({ url, name });
      },
      removeStyle: (key: string) => {
        console.log(key);
        styles.value = styles.value.filter(({ name }) => name !== key);
      },
      removeScript: (key: string) => {
        scripts.value = scripts.value.filter(({ name }) => name !== key);
      },
      scripts,
      styles
    };
  }
});
</script>
