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
import { useLocalVue, IframeWindow } from "@/compositions/LocalVue/";
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
    const { init, dragTag } = useLocalVue();
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
      loaded: async (w: IframeWindow) => {
        const c = await init(w);
        console.log("reload");
        components.value = c;
      },
      body,
      components,
      dragTag,
      treeNode,
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
